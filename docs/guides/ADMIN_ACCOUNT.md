# 管理员账户说明

## 🔐 默认管理员账户

系统已配置默认管理员账户，用于首次登录和系统管理。

### 登录凭据

```
邮箱: admin@admin.com
密码: admin
```

### 账户特权

- ✅ **Pro订阅等级**：拥有所有高级功能
- ✅ **完整访问权限**：可以访问所有功能模块
- ✅ **无限制使用**：不受免费版限制

## 🚀 首次使用

### 1. 启动系统

**Windows:**
```bash
start.bat
```

**Linux/Mac:**
```bash
chmod +x start.sh
./start.sh
```

### 2. 访问系统

打开浏览器访问：
```
http://localhost:3000
```

### 3. 登录

使用默认管理员账户登录：
- 邮箱：`admin@admin.com`
- 密码：`admin`

## ⚠️ 安全建议

### 生产环境必须修改密码！

1. **登录后立即修改密码**
   - 进入"设置"页面
   - 修改密码为强密码
   - 建议使用至少12位字符，包含大小写字母、数字和特殊字符

2. **修改邮箱地址**
   - 将默认邮箱改为真实邮箱
   - 便于接收系统通知和密码重置

3. **定期更新密码**
   - 建议每3个月更换一次密码
   - 不要使用与其他系统相同的密码

## 🔧 手动初始化管理员

如果需要重新创建管理员账户，可以运行：

```bash
cd backend
source venv/bin/activate  # Linux/Mac
# 或
call venv\Scripts\activate.bat  # Windows

python init_admin.py
```

## 📝 创建其他用户

### 方法1：通过注册页面

1. 访问 `http://localhost:3000/register`
2. 填写注册信息
3. 新用户默认为免费版

### 方法2：通过API

使用管理员账户调用用户创建API：

```bash
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "name": "User Name"
}
```

## 🛠️ 故障排查

### 问题：无法登录管理员账户

**解决方案：**

1. 检查数据库是否正常
2. 重新运行初始化脚本：
   ```bash
   cd backend
   python init_admin.py
   ```

### 问题：忘记管理员密码

**解决方案：**

1. 删除数据库中的管理员记录
2. 重新运行初始化脚本创建新账户

**SQLite数据库：**
```bash
cd backend
rm -f data/ai_time_management.db  # 删除数据库
python init_admin.py  # 重新初始化
```

**MySQL数据库：**
```sql
DELETE FROM users WHERE email = 'admin@admin.com';
```
然后运行 `python init_admin.py`

## 📊 管理员功能

管理员账户拥有以下特殊功能：

- ✅ **AI聊天助手**：无限制对话
- ✅ **高级洞察**：深度分析和建议
- ✅ **目标追踪**：无限目标和习惯
- ✅ **数据导出**：完整历史数据导出
- ✅ **API访问**：完整API访问权限
- ✅ **优先支持**：技术支持优先级

## 🔒 安全最佳实践

1. **强密码策略**
   - 至少12位字符
   - 包含大小写字母、数字、特殊字符
   - 避免使用常见单词或个人信息

2. **定期审计**
   - 定期检查用户活动日志
   - 监控异常登录行为
   - 及时删除不活跃账户

3. **备份策略**
   - 定期备份数据库
   - 保存配置文件副本
   - 测试恢复流程

4. **网络安全**
   - 使用HTTPS（生产环境）
   - 配置防火墙规则
   - 限制管理端口访问

## 📞 技术支持

如有问题，请查看：
- [快速启动指南](./快速启动指南.md)
- [项目状态报告](./PROJECT_STATUS.md)
- [部署指南](./DEPLOYMENT_GUIDE.md)

---

**最后更新：** 2025-11-26
**版本：** 1.0.0
