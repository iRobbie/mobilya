from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime

class MetaTags(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    keywords: List[str] = []
    og_image: Optional[str] = None

class ProductCreate(BaseModel):
    name: str
    description: str
    category: str
    images: List[str] = []
    features: List[str] = []
    meta_tags: Optional[MetaTags] = None
    featured: bool = False
    status: str = "active"  # active, inactive

class Product(BaseModel):
    id: str
    name: str
    description: str
    category: str
    images: List[str] = []
    features: List[str] = []
    meta_tags: Optional[MetaTags] = None
    featured: bool = False
    status: str = "active"
    created_at: datetime
    updated_at: datetime

class CategoryCreate(BaseModel):
    name: str
    slug: str
    description: Optional[str] = None
    keywords: List[str] = []
    meta_tags: Optional[MetaTags] = None

class Category(BaseModel):
    id: str
    name: str
    slug: str
    description: Optional[str] = None
    keywords: List[str] = []
    meta_tags: Optional[MetaTags] = None
    created_at: datetime

class BlogCreate(BaseModel):
    title: str
    content: str
    excerpt: Optional[str] = None
    category: Optional[str] = None
    meta_tags: Optional[MetaTags] = None
    featured_image: Optional[str] = None
    status: str = "published"  # published, draft

class Blog(BaseModel):
    id: str
    title: str
    content: str
    excerpt: Optional[str] = None
    category: Optional[str] = None
    meta_tags: Optional[MetaTags] = None
    featured_image: Optional[str] = None
    status: str = "published"
    created_at: datetime
    updated_at: datetime

class Image(BaseModel):
    id: str
    filename: str
    original_name: str
    url: str
    product_id: Optional[str] = None
    uploaded_at: datetime