from pydantic import BaseModel
from datetime import datetime
from typing import List, Optional, Union
from enum import Enum

class AccountType(str, Enum):
    ASSET = "ASSET"
    LIABILITY = "LIABILITY"
    EQUITY = "EQUITY"
    REVENUE = "REVENUE"
    EXPENSE = "EXPENSE"

class AccountBase(BaseModel):
    name: str
    account_type: AccountType
    code: str
    description: Optional[str] = None
    is_active: bool = True

class AccountCreate(AccountBase):
    pass

class Account(AccountBase):
    id: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class TransactionDetailBase(BaseModel):
    account_id: str
    debit: float = 0.0
    credit: float = 0.0
    description: Optional[str] = None

class TransactionBase(BaseModel):
    date: datetime
    reason: str
    description: Optional[str] = None
    details: List[TransactionDetailBase]

class TransactionCreate(TransactionBase):
    pass

class TransactionDetail(TransactionDetailBase):
    id: str
    transaction_id: str

    class Config:
        from_attributes = True

class Transaction(TransactionBase):
    id: str
    entry_number: int
    created_at: datetime
    updated_at: datetime
    details: List[TransactionDetail]

    class Config:
        from_attributes = True

class TAccountEntry(BaseModel):
    date: datetime
    entry_number: int
    reason: str
    debit: float
    credit: float
    balance: float

class TAccountView(BaseModel):
    account_id: str
    account_name: str
    account_type: AccountType
    entries: List[TAccountEntry]
    total_debit: float
    total_credit: float
    final_balance: float

class FinancialStatement(BaseModel):
    assets: float
    liabilities: float
    equity: float
    revenue: float
    expenses: float
    net_income: float
    start_date: datetime
    end_date: datetime

class ResultsSummary(BaseModel):
    revenue: float
    expenses: float
    net_income: float
    start_date: datetime
    end_date: datetime
