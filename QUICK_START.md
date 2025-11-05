# ⚡ QUICK START - Inicia Aquí

## 🚀 En 30 Segundos

```bash
# Abre 2 terminales

# Terminal 1:
cd /home/llibre/apartamento_airbnb/backend && npm run start:dev

# Terminal 2:
cd /home/llibre/apartamento_airbnb/frontend && npm run dev

# Luego abre en navegador:
# http://localhost:3000
```

**Credenciales:**
```
Email: demo1761960285@apartamentos.com
Pass:  DemoPass123
```

---

## 📚 Documentación Completa

| Documento | Para |
|-----------|------|
| `README.md` | Visión general del proyecto |
| `GET_STARTED.md` | Primeros pasos detallados |
| `DEVELOPMENT.md` | Cómo desarrollar nuevas features |
| `ARCHITECTURE.md` | Entender el diseño técnico |
| `ESTADO_SISTEMA.md` | Estado actual de todo |
| `ACCESO_EXTERNO.md` | Compartir con internet |
| `FAQ.md` | Preguntas comunes |
| `POLICIES.md` | Estándares del código |

---

## ✅ Verificar que Funciona

```bash
# Frontend
curl -s http://localhost:3000 > /dev/null && echo "✅ Frontend OK"

# Backend
curl -s http://localhost:3001/api/auth/me > /dev/null && echo "✅ Backend OK"

# Login test
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"demo1761960285@apartamentos.com","password":"DemoPass123"}' | jq '.access_token' | head -c 50
```

---

## 🔧 Troubleshooting Rápido

**Puerto en uso:**
```bash
pkill -9 npm; pkill -9 node; sleep 2
# Reinicia desde arriba
```

**Ver logs en background:**
```bash
# Backend log
tail -f /tmp/backend.log

# Frontend log
tail -f /tmp/frontend.log
```

---

## 🌐 Compartir por Internet

Ver `ACCESO_EXTERNO.md`

```bash
ssh -R 80:localhost:3000 serveo.net
```

---

## 📊 URLs Importantes

| Servicio | URL |
|----------|-----|
| App | http://localhost:3000 |
| API | http://localhost:3001/api |
| Swagger | http://localhost:3001/api/docs |
| Health | http://localhost:3001/api/auth/me |

---

**¡Listo para comenzar!** 🎉
