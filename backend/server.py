from fastapi import FastAPI, File, UploadFile, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.staticfiles import StaticFiles
from pymongo import MongoClient
from bson import ObjectId
from datetime import datetime, timedelta
import os
import uuid
import shutil
from pathlib import Path
from typing import List, Optional
import logging

# Import models
from models import Product, Category, Blog, Image, ProductCreate, CategoryCreate, BlogCreate

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="Furns Portfolio API", version="1.0.0", description="API for Furns Product Showcase")

# CORS configuration
origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "*"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["*"],
)

# MongoDB connection
MONGO_URL = os.environ.get('MONGO_URL', 'mongodb://localhost:27017/furns_portfolio')
client = MongoClient(MONGO_URL)
db = client.furns_portfolio

# Collections
products_collection = db.products
categories_collection = db.categories
blogs_collection = db.blogs
images_collection = db.images

# Create uploads directory
UPLOAD_DIR = Path("/app/backend/uploads")
UPLOAD_DIR.mkdir(exist_ok=True)

# Serve static files
app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")

# Simple authentication (in production, use proper JWT with user management)
security = HTTPBearer()
API_SECRET = os.environ.get('API_SECRET', 'furns-admin-secret-2024')

def verify_admin_token(credentials: HTTPAuthorizationCredentials = Depends(security)):
    if credentials.credentials != API_SECRET:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return credentials.credentials

# Utility functions
def convert_objectid(doc):
    """Convert MongoDB ObjectId to string"""
    if doc and "_id" in doc:
        doc["id"] = str(doc["_id"])
        del doc["_id"]
    return doc

def convert_objectids_in_list(docs):
    """Convert ObjectIds in a list of documents"""
    return [convert_objectid(doc) for doc in docs]

# Health check
@app.get("/api/health")
async def health_check():
    return {"status": "healthy", "service": "furns-portfolio-api"}

# PRODUCTS ENDPOINTS
@app.get("/api/products")
async def get_products(
    category: Optional[str] = None,
    featured: Optional[bool] = None,
    limit: Optional[int] = None
):
    """Get all products with optional filtering"""
    try:
        filter_query = {}
        if category:
            filter_query["category"] = category
        if featured is not None:
            filter_query["featured"] = featured
        
        cursor = products_collection.find(filter_query)
        if limit:
            cursor = cursor.limit(limit)
        
        products = list(cursor)
        return convert_objectids_in_list(products)
    except Exception as e:
        logger.error(f"Error fetching products: {e}")
        raise HTTPException(status_code=500, detail="Error fetching products")

@app.get("/api/products/{product_id}")
async def get_product(product_id: str):
    """Get a single product by ID"""
    try:
        if ObjectId.is_valid(product_id):
            product = products_collection.find_one({"_id": ObjectId(product_id)})
        else:
            product = products_collection.find_one({"id": product_id})
        
        if not product:
            raise HTTPException(status_code=404, detail="Product not found")
        
        return convert_objectid(product)
    except Exception as e:
        logger.error(f"Error fetching product {product_id}: {e}")
        raise HTTPException(status_code=500, detail="Error fetching product")

@app.post("/api/products")
async def create_product(product: ProductCreate, _: str = Depends(verify_admin_token)):
    """Create a new product"""
    try:
        product_dict = product.dict()
        product_dict["id"] = str(uuid.uuid4())
        product_dict["created_at"] = datetime.utcnow()
        product_dict["updated_at"] = datetime.utcnow()
        
        result = products_collection.insert_one(product_dict)
        created_product = products_collection.find_one({"_id": result.inserted_id})
        
        return convert_objectid(created_product)
    except Exception as e:
        logger.error(f"Error creating product: {e}")
        raise HTTPException(status_code=500, detail="Error creating product")

@app.put("/api/products/{product_id}")
async def update_product(product_id: str, product: ProductCreate, _: str = Depends(verify_admin_token)):
    """Update a product"""
    try:
        product_dict = product.dict()
        product_dict["updated_at"] = datetime.utcnow()
        
        if ObjectId.is_valid(product_id):
            result = products_collection.update_one(
                {"_id": ObjectId(product_id)}, 
                {"$set": product_dict}
            )
        else:
            result = products_collection.update_one(
                {"id": product_id}, 
                {"$set": product_dict}
            )
        
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="Product not found")
        
        updated_product = products_collection.find_one({"id": product_id})
        return convert_objectid(updated_product)
    except Exception as e:
        logger.error(f"Error updating product {product_id}: {e}")
        raise HTTPException(status_code=500, detail="Error updating product")

@app.delete("/api/products/{product_id}")
async def delete_product(product_id: str, _: str = Depends(verify_admin_token)):
    """Delete a product"""
    try:
        if ObjectId.is_valid(product_id):
            result = products_collection.delete_one({"_id": ObjectId(product_id)})
        else:
            result = products_collection.delete_one({"id": product_id})
        
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Product not found")
        
        return {"status": "success", "message": "Product deleted"}
    except Exception as e:
        logger.error(f"Error deleting product {product_id}: {e}")
        raise HTTPException(status_code=500, detail="Error deleting product")

# CATEGORIES ENDPOINTS
@app.get("/api/categories")
async def get_categories():
    """Get all categories"""
    try:
        categories = list(categories_collection.find())
        return convert_objectids_in_list(categories)
    except Exception as e:
        logger.error(f"Error fetching categories: {e}")
        raise HTTPException(status_code=500, detail="Error fetching categories")

@app.post("/api/categories")
async def create_category(category: CategoryCreate, _: str = Depends(verify_admin_token)):
    """Create a new category"""
    try:
        category_dict = category.dict()
        category_dict["id"] = str(uuid.uuid4())
        category_dict["created_at"] = datetime.utcnow()
        
        result = categories_collection.insert_one(category_dict)
        created_category = categories_collection.find_one({"_id": result.inserted_id})
        
        return convert_objectid(created_category)
    except Exception as e:
        logger.error(f"Error creating category: {e}")
        raise HTTPException(status_code=500, detail="Error creating category")

# BLOGS ENDPOINTS
@app.get("/api/blogs")
async def get_blogs(limit: Optional[int] = None):
    """Get all blog posts"""
    try:
        cursor = blogs_collection.find().sort("created_at", -1)
        if limit:
            cursor = cursor.limit(limit)
        
        blogs = list(cursor)
        return convert_objectids_in_list(blogs)
    except Exception as e:
        logger.error(f"Error fetching blogs: {e}")
        raise HTTPException(status_code=500, detail="Error fetching blogs")

@app.post("/api/blogs")
async def create_blog(blog: BlogCreate, _: str = Depends(verify_admin_token)):
    """Create a new blog post"""
    try:
        blog_dict = blog.dict()
        blog_dict["id"] = str(uuid.uuid4())
        blog_dict["created_at"] = datetime.utcnow()
        blog_dict["updated_at"] = datetime.utcnow()
        
        result = blogs_collection.insert_one(blog_dict)
        created_blog = blogs_collection.find_one({"_id": result.inserted_id})
        
        return convert_objectid(created_blog)
    except Exception as e:
        logger.error(f"Error creating blog: {e}")
        raise HTTPException(status_code=500, detail="Error creating blog")

# IMAGE UPLOAD ENDPOINTS
@app.post("/api/upload")
async def upload_image(file: UploadFile = File(...), _: str = Depends(verify_admin_token)):
    """Upload an image"""
    try:
        # Validate file type
        if not file.content_type.startswith('image/'):
            raise HTTPException(status_code=400, detail="File must be an image")
        
        # Generate unique filename
        file_extension = file.filename.split('.')[-1]
        unique_filename = f"{uuid.uuid4()}.{file_extension}"
        file_path = UPLOAD_DIR / unique_filename
        
        # Save file
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        # Save to database
        image_doc = {
            "id": str(uuid.uuid4()),
            "filename": unique_filename,
            "original_name": file.filename,
            "url": f"/uploads/{unique_filename}",
            "uploaded_at": datetime.utcnow()
        }
        
        result = images_collection.insert_one(image_doc)
        created_image = images_collection.find_one({"_id": result.inserted_id})
        
        return convert_objectid(created_image)
    except Exception as e:
        logger.error(f"Error uploading image: {e}")
        raise HTTPException(status_code=500, detail="Error uploading image")

@app.get("/api/images")
async def get_images(_: str = Depends(verify_admin_token)):
    """Get all uploaded images"""
    try:
        images = list(images_collection.find().sort("uploaded_at", -1))
        return convert_objectids_in_list(images)
    except Exception as e:
        logger.error(f"Error fetching images: {e}")
        raise HTTPException(status_code=500, detail="Error fetching images")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)