from pydantic import BaseModel, EmailStr, Field


class RestaurantRegister(BaseModel):
    restaurantName: str
    ownerName: str
    email: EmailStr
    phone: str
    password: str
    confirmPassword: str
    address: str
    logo: str = ""
    theme: dict = Field(default_factory=lambda: {
        "themeName": "terracotta",
        "primaryColor": "#c65d3a",
        "secondaryColor": "#e7a66a",
        "backgroundColor": "#faf7f2",
        "cardColor": "#ffffff",
        "textColor": "#292524",
    })
    captcha_id: str
    captcha_answer: str


class RestaurantLogin(BaseModel):
    email: EmailStr
    password: str
    captcha_id: str
    captcha_answer: str
    remember_me: bool = False


class RestaurantEmailVerification(BaseModel):
    email: EmailStr
    otp: str = Field(min_length=6, max_length=6)


class RestaurantResendVerification(BaseModel):
    email: EmailStr
