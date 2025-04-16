# P.I.A.R II. Cap amb IA

Aquest projecte mostra una aplicació web que utilitza Intel·ligència Artificial (IA) per detectar moviments facials en temps real i enviar-los a una micro:bit a través de Bluetooth.

## ✨ Funcionalitats

- Detecció de:
  - Gir horitzontal del cap (yaw)
  - Obertura de la boca
  - Ull esquerre i dret (obert/tancat)
  - Somriure (rang 0–10)
  - Front arrugat (rang 0–10)
  - Celles alçades (rang 0–999)
- Dibuix dels trets facials (cara, ulls, boca, celles)
- Enviament de dades per UART a micro:bit (sense emparellament)
- Interfície adaptada per a dispositius mòbils
- Panell d'anàlisi amb transparència
- Compatible amb GitHub Pages

## 📤 Format de dades enviades via Bluetooth (UART)

| Camps              | Dígits | Exemple |
|--------------------|--------|---------|
| Gir horitzontal    | 2      | `73`    |
| Boca               | 2      | `10`    |
| Ull esquerre       | 1      | `1`     |
| Ull dret           | 1      | `1`     |
| Somriure           | 2      | `07`    |
| Celles alçades     | 3      | `632`   |
| Front arrugat      | 2      | `03`    |

Dades totals: **13 caràcters**

## ❤️ Autor

Fet per **Jose** amb ❤️ i tecnologia IA.
