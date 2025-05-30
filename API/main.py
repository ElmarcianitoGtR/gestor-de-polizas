from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime
import crud, schemas, models
from database import SessionLocal, engine
import uuid
import uvicorn

models.Base.metadata.create_all(bind=engine)
app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

#    Endpoits to accounts
@app.get("/health")
async def health_check():
    return {"status": "ok"}

@app.get("/accounts", response_model=List[schemas.Account])
def read_accounts(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    accounts = crud.get_accounts(db, skip=skip, limit=limit)
    return accounts

@app.get("/accounts/{account_id}", response_model=schemas.Account)
def read_account(account_id: str, db: Session = Depends(get_db)):
    db_account = crud.get_account(db, account_id=account_id)
    if db_account is None:
        raise HTTPException(status_code=404, detail="Account not found")
    return db_account

@app.post("/accounts", response_model=schemas.Account)
def create_account(account: schemas.AccountCreate, db: Session = Depends(get_db)):
    return crud.create_account(db=db, account=account)

@app.put("/accounts/{account_id}", response_model=schemas.Account)
def update_account(account_id: str, account: schemas.AccountCreate, db: Session = Depends(get_db)):
    db_account = crud.update_account(db, account_id=account_id, account_data=account.dict(exclude_unset=True))
    if db_account is None:
        raise HTTPException(status_code=404, detail="Account not found")
    return db_account

@app.delete("/accounts/{account_id}")
def delete_account(account_id: str, db: Session = Depends(get_db)):
    success = crud.delete_account(db, account_id=account_id)
    if not success:
        raise HTTPException(status_code=404, detail="Account not found")
    return {"message": "Account deleted successfully"}

# Endpoints to transactions

@app.get("/transactions", response_model=List[schemas.Transaction])
def read_transactions(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    transactions = crud.get_transactions(db, skip=skip, limit=limit)
    return transactions

@app.get("/transactions/{transaction_id}", response_model=schemas.Transaction)
def read_transaction(transaction_id: str, db: Session = Depends(get_db)):
    db_transaction = crud.get_transaction(db, transaction_id=transaction_id)
    if db_transaction is None:
        raise HTTPException(status_code=404, detail="Transaction not found")
    return db_transaction

@app.post("/transactions", response_model=schemas.Transaction)
def create_transaction(transaction: schemas.TransactionCreate, db: Session = Depends(get_db)):
    return crud.create_transaction(db=db, transaction=transaction)

@app.put("/transactions/{transaction_id}", response_model=schemas.Transaction)
def update_transaction(transaction_id: str, transaction: schemas.TransactionCreate, db: Session = Depends(get_db)):
    db_transaction = crud.update_transaction(db, transaction_id=transaction_id, transaction_data=transaction.dict(exclude_unset=True))
    if db_transaction is None:
        raise HTTPException(status_code=404, detail="Transaction not found")
    return db_transaction

@app.delete("/transactions/{transaction_id}")
def delete_transaction(transaction_id: str, db: Session = Depends(get_db)):
    success = crud.delete_transaction(db, transaction_id=transaction_id)
    if not success:
        raise HTTPException(status_code=404, detail="Transaction not found")
    return {"message": "Transaction deleted successfully"}

# Endpoints to catalogs

@app.get("/catalogs/account-names", response_model=List[str])
def read_predefined_account_names():
    return crud.get_predefined_account_names()

@app.get("/catalogs/reasons", response_model=List[str])
def read_predefined_reasons():
    return crud.get_predefined_reasons()

# Enpoints to T-Accounts [T diagram data]

@app.get("/t-accounts/{account_id}", response_model=schemas.TAccountView)
def read_t_account(account_id: str, reason: str = None, db: Session = Depends(get_db)):
    t_account = crud.generate_t_account(db, account_id=account_id, reason=reason)
    if t_account is None:
        raise HTTPException(status_code=404, detail="Account not found or no transactions")
    return t_account

@app.get("/t-accounts/by-reason/{reason}", response_model=List[schemas.TAccountView])
def read_t_accounts_by_reason(reason: str, db: Session = Depends(get_db)):
    t_accounts = crud.generate_t_accounts_by_reason(db, reason=reason)
    if not t_accounts:
        raise HTTPException(status_code=404, detail="No transactions found with this reason")
    return t_accounts

# Endpoints to financial statments

@app.get("/financial-statements", response_model=schemas.FinancialStatement)
def read_financial_statement(start_date: datetime, end_date: datetime, db: Session = Depends(get_db)):
    return crud.generate_financial_statement(db, start_date=start_date, end_date=end_date)

# Endpoits to results summary

@app.get("/results-summary", response_model=schemas.ResultsSummary)
def read_results_summary(start_date: datetime, end_date: datetime, db: Session = Depends(get_db)):
    return crud.generate_results_summary(db, start_date=start_date, end_date=end_date)
