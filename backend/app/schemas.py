from typing import Literal, Optional

from pydantic import BaseModel, EmailStr, Field


class RegisterIn(BaseModel):
    name: str = Field(min_length=2, max_length=60)
    email: EmailStr
    password: str = Field(min_length=6, max_length=72)
    phone: Optional[str] = Field(None, max_length=15)


class LoginIn(BaseModel):
    # "email" may hold an email address OR a 10-digit mobile number (the field keeps its name so existing clients keep working)
    email: str = Field(min_length=3, max_length=100)
    password: str


class ProfileIn(BaseModel):
    name: Optional[str] = Field(None, min_length=2, max_length=60)
    email: Optional[EmailStr] = None
    phone: Optional[str] = Field(None, max_length=15)
    profile_image: Optional[str] = Field(None, max_length=500)


class PasswordIn(BaseModel):
    current_password: str
    new_password: str = Field(min_length=6, max_length=72)


class CartAdd(BaseModel):
    product_id: str
    quantity: int = Field(1, ge=1, le=50)
    unit: str = Field("", max_length=30)  # PART 7: chosen pack label


class CartQty(BaseModel):
    quantity: int = Field(ge=0, le=50)  # 0 removes the item
    unit: str = Field("", max_length=30)  # PART 7: chosen pack label


class AddressIn(BaseModel):
    name: str = Field(min_length=2, max_length=60)
    phone: str = Field(min_length=10, max_length=15)
    address_line: str = Field(min_length=3, max_length=200)
    city: str = Field(max_length=60)
    state: str = Field(max_length=60)
    pincode: str = Field(pattern=r"^\d{6}$")
    landmark: str = Field("", max_length=100)
    type: Literal["Home", "Work", "Other"] = "Home"
    is_default: bool = False


# PART 8: checkout 3 steps -> Address, Payment, Review. Every payment method is a
# DEMO only (no gateway, no real money); COD is paid on delivery, the rest are "paid" instantly.
PaymentMethod = Literal["COD", "upi", "card", "wallet"]
DeliveryOption = Literal["standard", "express"]


class OrderIn(BaseModel):
    address_id: str
    payment_method: PaymentMethod = "COD"
    delivery_option: DeliveryOption = "standard"


class PackSize(BaseModel):
    label: str = Field(min_length=1, max_length=30)
    price: float = Field(gt=0)
    original_price: Optional[float] = Field(None, gt=0)


class ProductIn(BaseModel):
    name: str = Field(min_length=2, max_length=120)
    description: str = Field("", max_length=2000)
    price: float = Field(gt=0, le=1000000)
    original_price: Optional[float] = Field(None, gt=0, le=1000000)
    images: list[str] = Field([], max_length=10)
    category_id: str
    stock: int = Field(0, ge=0, le=1000000)
    unit: str = Field("1 pc", max_length=30)
    # PART 6: listing facets (sub-category chip row + Brand / Organic filters)
    subcategory: str = Field("", max_length=40)
    brand: str = Field("", max_length=40)
    organic: bool = False
    # PART 7: leave empty to let the backend derive pack sizes from the unit price
    pack_sizes: list[PackSize] = Field([], max_length=10)
    featured: bool = False
    active: bool = True


class StatusIn(BaseModel):
    status: Literal["pending", "confirmed", "packed", "shipped", "delivered", "cancelled"]


class CategoryIn(BaseModel):
    name: str = Field(min_length=2, max_length=40)
    description: str = Field("", max_length=200)
    image: str = Field("", max_length=500)
    active: bool = True
