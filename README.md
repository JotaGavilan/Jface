
# PIAR II · El cap amb IA

Aquesta aplicació web utilitza **Intel·ligència Artificial (IA)** per a detectar en temps real:

- ✅ La rotació horitzontal del cap (yaw)
- ✅ L’obertura de la boca
- ✅ L’estat dels ulls (obert/tancat)

Les dades es mostren en pantalla i es transmeten automàticament per **Bluetooth (UART)** a una **micro:bit v2**.

---

## 📡 Format dels valors enviats per UART

Cadena de 6 dígits:

```
YYMMED
```

- `YY` → Rotació horitzontal del cap (00–99)
- `MM` → Obertura de la boca (00–99)
- `E`  → Ull esquerre: 0 = tancat, 1 = obert
- `D`  → Ull dret: 0 = tancat, 1 = obert

**Exemple:** `078511` → cap 07, boca 85, ull esquerre obert, dret tancat.

---

## 🔗 Funcionament

1. S’obri des d’un navegador compatible (Chrome/Edge)
2. Es demana accés a la càmera
3. Es fa clic a **🔗 Connectar** per vincular-se amb la micro:bit
4. Els valors es mostren i s’envien contínuament

---

## 📲 Requisits

- micro:bit v2 amb servei UART actiu (`bluetooth.startUartService()`)
- Navegador amb suport per Web Bluetooth (Chrome o Edge)
- Connexió HTTPS (GitHub Pages o similar)

---

## 🙌 Inspiració

Aquesta aplicació està basada en la idea original de:

🔗 https://cardboard.lofirobot.com/face-app-info/

---

## 🔒 Notes de privadesa

Aquesta app NO envia dades a cap servidor. Tot el processament es fa al navegador localment.

---

Desenvolupat per l’equip **PIAR II** amb ❤️ i tecnologia IA.
