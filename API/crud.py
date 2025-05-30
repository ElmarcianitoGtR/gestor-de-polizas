from sqlalchemy.orm import Session
from models import Account, Transaction, TransactionDetail
import uuid
from datetime import datetime
import schemas 
import models

# Accounnt operations


def get_accounts(db: Session, skip: int = 0, limit: int = 100):
    return db.query(Account).offset(skip).limit(limit).all()

def get_account(db: Session, account_id: str):
    return db.query(Account).filter(Account.id == account_id).first()

def create_account(db: Session, account: schemas.AccountCreate):
    db_account = Account(
        id=str(uuid.uuid4()),
        name=account.name,
        account_type=account.account_type,
        code=account.code,
        description=account.description,
        is_active=account.is_active
    )
    db.add(db_account)
    db.commit()
    db.refresh(db_account)
    return db_account

def update_account(db: Session, account_id: str, account_data: dict):
    db_account = db.query(Account).filter(Account.id == account_id).first()
    if not db_account:
        return None
    
    for key, value in account_data.items():
        setattr(db_account, key, value)
    
    db.commit()
    db.refresh(db_account)
    return db_account

def delete_account(db: Session, account_id: str):
    db_account = db.query(Account).filter(Account.id == account_id).first()
    if not db_account:
        return False
    
    db.delete(db_account)
    db.commit()
    return True



# Transaction operations



def get_transactions(db: Session, skip: int = 0, limit: int = 100):
    return db.query(Transaction).offset(skip).limit(limit).all()

def get_transaction(db: Session, transaction_id: str):
    return db.query(Transaction).filter(Transaction.id == transaction_id).first()

def create_transaction(db: Session, transaction: schemas.TransactionCreate):
    # Get next entry number
    last_entry = db.query(Transaction).order_by(Transaction.entry_number.desc()).first()
    next_entry = 1 if last_entry is None else last_entry.entry_number + 1

    db_transaction = Transaction(
        id=str(uuid.uuid4()),
        entry_number=next_entry,
        date=transaction.date,
        reason=transaction.reason,
        description=transaction.description
    )
    db.add(db_transaction)
    db.commit()

    
    
    # Create transaction details
    for detail in transaction.details:
        db_detail = TransactionDetail(
            id=str(uuid.uuid4()),
            transaction_id=db_transaction.id,
            account_id=detail.account_id,
            debit=detail.debit,
            credit=detail.credit,
            description=detail.description
        )
        db.add(db_detail)
    
    db.commit()
    db.refresh(db_transaction)
    return db_transaction

def update_transaction(db: Session, transaction_id: str, transaction_data: dict):
    db_transaction = db.query(Transaction).filter(Transaction.id == transaction_id).first()
    if not db_transaction:
        return None
    
    for key, value in transaction_data.items():
        if key != "details":
            setattr(db_transaction, key, value)
    
    db.commit()
    db.refresh(db_transaction)
    return db_transaction

def delete_transaction(db: Session, transaction_id: str):
    db_transaction = db.query(Transaction).filter(Transaction.id == transaction_id).first()
    if not db_transaction:
        return False
    
    db.delete(db_transaction)
    db.commit()
    return True

# Catalog operations
def get_predefined_account_names():
    return [
        "Cash", "Accounts Receivable", "Inventory", "Equipment", 
        "Accounts Payable", "Loans Payable", "Common Stock", 
        "Retained Earnings", "Sales Revenue", "Cost of Goods Sold",
        "Rent Expense", "Salaries Expense", "Utilities Expense"
    ]

def get_predefined_reasons():
    return [
        "Sale", "Purchase", "Payment", "Receipt", 
        "Adjustment", "Depreciation", "Salary Payment"
    ]

# T-Account operations
def generate_t_account(db: Session, account_id: str, reason: str = None):
    account = db.query(Account).filter(Account.id == account_id).first()
    if not account:
        return None
    
    query = db.query(
        TransactionDetail,
        Transaction
    ).join(
        Transaction,
        TransactionDetail.transaction_id == Transaction.id
    ).filter(
        TransactionDetail.account_id == account_id
    )
    
    if reason:
        query = query.filter(Transaction.reason == reason)
    
    entries = query.order_by(Transaction.date).all()
    
    t_account_entries = []
    balance = 0.0
    
    for detail, transaction in entries:
        if account.account_type in ["ASSET", "EXPENSE"]:
            balance += detail.debit - detail.credit
        else:
            balance += detail.credit - detail.debit
        
        t_account_entries.append(
            schemas.TAccountEntry(
                date=transaction.date,
                entry_number=transaction.entry_number,
                reason=transaction.reason,
                debit=detail.debit,
                credit=detail.credit,
                balance=balance
            )
        )
    
    total_debit = sum([e.debit for e in t_account_entries])
    total_credit = sum([e.credit for e in t_account_entries])
    
    return schemas.TAccountView(
        account_id=account.id,
        account_name=account.name,
        account_type=account.account_type,
        entries=t_account_entries,
        total_debit=total_debit,
        total_credit=total_credit,
        final_balance=balance
    )

def generate_t_accounts_by_reason(db: Session, reason: str):
    # Get all transactions with this reason
    transactions = db.query(Transaction).filter(Transaction.reason == reason).all()
    if not transactions:
        return []
    
    # Get all accounts involved in these transactions
    account_ids = db.query(
        TransactionDetail.account_id
    ).join(
        Transaction,
        TransactionDetail.transaction_id == Transaction.id
    ).filter(
        Transaction.reason == reason
    ).distinct().all()
    
    account_ids = [a[0] for a in account_ids]
    
    t_accounts = []
    for account_id in account_ids:
        t_account = generate_t_account(db, account_id, reason)
        if t_account:
            t_accounts.append(t_account)
    
    return t_accounts

# Financial Statements operations
def generate_financial_statement(db: Session, start_date: datetime, end_date: datetime):
    # Get all transactions in the date range
    transactions = db.query(Transaction).filter(
        Transaction.date >= start_date,
        Transaction.date <= end_date
    ).all()
    
    if not transactions:
        return schemas.FinancialStatement(
            assets=0,
            liabilities=0,
            equity=0,
            revenue=0,
            expenses=0,
            net_income=0,
            start_date=start_date,
            end_date=end_date
        )
    
    # Get all account balances
    accounts = db.query(Account).all()
    
    assets = 0.0
    liabilities = 0.0
    equity = 0.0
    revenue = 0.0
    expenses = 0.0
    
    for account in accounts:
        t_account = generate_t_account(db, account.id)
        if not t_account:
            continue
        
        if account.account_type == "ASSET":
            assets += t_account.final_balance
        elif account.account_type == "LIABILITY":
            liabilities += t_account.final_balance
        elif account.account_type == "EQUITY":
            equity += t_account.final_balance
        elif account.account_type == "REVENUE":
            revenue += t_account.final_balance
        elif account.account_type == "EXPENSE":
            expenses += t_account.final_balance
    
    net_income = revenue - expenses
    
    return schemas.FinancialStatement(
        assets=assets,
        liabilities=liabilities,
        equity=equity + net_income,
        revenue=revenue,
        expenses=expenses,
        net_income=net_income,
        start_date=start_date,
        end_date=end_date
    )

def generate_results_summary(db: Session, start_date: datetime, end_date: datetime):
    financial_statement = generate_financial_statement(db, start_date, end_date)
    
    return schemas.ResultsSummary(
        revenue=financial_statement.revenue,
        expenses=financial_statement.expenses,
        net_income=financial_statement.net_income,
        start_date=start_date,
        end_date=end_date
    )
