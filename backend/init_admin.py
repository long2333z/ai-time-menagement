"""
初始化脚本 - 创建默认管理员账户
运行此脚本将创建默认的 admin/admin 账户
"""
from sqlalchemy.orm import Session
from passlib.context import CryptContext
from database import SessionLocal, engine, Base
from models import User
import sys
import os

# 设置控制台编码为 UTF-8
if sys.platform == "win32":
    os.system("chcp 65001 >nul 2>&1")

# 密码加密上下文
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(password: str) -> str:
    """加密密码"""
    return pwd_context.hash(password)

def create_admin_user(db: Session):
    """创建默认管理员账户"""
    try:
        # 检查是否已存在 admin 用户
        existing_admin = db.query(User).filter(User.email == "admin@admin.com").first()
        
        if existing_admin:
            print("[警告] 管理员账户已存在")
            print(f"   邮箱: admin@admin.com")
            print(f"   用户ID: {existing_admin.id}")
            return False
        
        # 创建管理员用户
        admin_user = User(
            email="admin@admin.com",
            password_hash=hash_password("admin123456"),
            name="Administrator",
            timezone="Asia/Shanghai",
            language="zh-CN",
            subscription_tier="pro",  # 给管理员最高权限
            occupation="System Administrator",
            work_mode="office"
        )
        
        db.add(admin_user)
        db.commit()
        db.refresh(admin_user)
        
        print("[完成] 默认管理员账户创建成功！")
        print(f"   邮箱: admin@admin.com")
        print(f"   密码: admin123456")
        print(f"   用户ID: {admin_user.id}")
        print(f"   订阅等级: {admin_user.subscription_tier}")
        print("")
        print("[警告] 重要提示：请在生产环境中立即修改默认密码！")
        
        return True
        
    except Exception as e:
        db.rollback()
        print(f"[错误] 创建管理员账户失败: {str(e)}")
        return False

def main():
    """主函数"""
    print("=" * 60)
    print("  AI时间管理系统 - 初始化管理员账户")
    print("=" * 60)
    print("")
    
    # 创建数据库表（如果不存在）
    print("[信息] 检查数据库表...")
    Base.metadata.create_all(bind=engine)
    print("[完成] 数据库表检查完成")
    print("")
    
    # 创建数据库会话
    db = SessionLocal()
    
    try:
        # 创建管理员账户
        success = create_admin_user(db)
        
        if success:
            print("")
            print("=" * 60)
            print("  初始化完成！")
            print("=" * 60)
            print("")
            print("现在可以使用以下凭据登录：")
            print("  邮箱: admin@admin.com")
            print("  密码: admin123456")
            print("")
            sys.exit(0)
        else:
            sys.exit(1)
            
    except Exception as e:
        print(f"[错误] 初始化失败: {str(e)}")
        sys.exit(1)
    finally:
        db.close()

if __name__ == "__main__":
    main()
