# P.I.A.R II. Cap amb IA

Aquest projecte mostra una aplicació web que utilitza Intel·ligència Artificial (IA) per detectar moviments facials en temps real i enviar-los a una micro:bit a través de Bluetooth.

## ✨ Funcionalitats

- Detecció de:
  - Gir horitzontal del cap (yaw)
  - Obertura de la boca
  - Ull esquerre i dret (obert/tancat)
- Dibuix d'una malla completa facial (tessel·lació)
- Enviament de dades per UART a micro:bit (sense emparellament)
- Interfície adaptada per a dispositius mòbils

## 📤 Format de dades enviades via Bluetooth (UART)

| Camps              | Dígits | Exemple |
|--------------------|--------|---------|
| Gir horitzontal    | 2      | `73`    |
| Boca               | 2      | `10`    |
| Ull esquerre       | 1      | `1`     |
| Ull dret           | 1      | `1`     |

Dades totals: **6 caràcters**

## ❤️ Autor

Fet per **Jose** amb ❤️ i tecnologia IA.

Projecte inspirat en: [cardboard.lofirobot.com](https://cardboard.lofirobot.com)
