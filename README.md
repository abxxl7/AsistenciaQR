# Escáner QR de Asistencia (PoC)

Prueba de concepto para la materia **Tecnologías Emergentes** — Tema 1: *Frameworks de Desarrollo Móvil Multiplataforma (React Native vs. Flutter)*.

## Problema que resuelve

El control de asistencia en clases o eventos universitarios se suele hacer en papel: es lento, alguien puede firmar por otra persona y después hay que pasar todo a digital a mano. Esta app escanea el QR del carnet/credencial de cada estudiante y registra la asistencia al instante, sin papel ni doble carga de datos.

## Qué incluye esta PoC

- Escaneo de QR con la cámara del dispositivo (`expo-camera`)
- Validación contra una lista mock de estudiantes (`lib/students.ts`)
- Detección de duplicados (QR ya escaneado)
- Manejo de QR no reconocido
- Persistencia local del registro de asistencia (`AsyncStorage`, sobrevive a cerrar la app)
- Pantalla con la lista de asistencia (nombre, id, hora, orden de llegada)
- Exportar/compartir el registro como archivo CSV
- Botón para reiniciar la demo

**Fuera de alcance** (a propósito, por tratarse de una PoC con datos mock): backend/servidor, login, edición manual de registros.

## Stack técnico

| Pieza | Elección | Por qué |
|---|---|---|
| Framework | Expo (managed workflow) + React Native | Setup inmediato, se prueba en el celular con Expo Go sin configurar Xcode/Android Studio |
| Navegación | `expo-router` (2 tabs) | Ruteo basado en archivos, estándar actual de Expo |
| Cámara / QR | `expo-camera` (`CameraView` + `onBarcodeScanned`) | Escaneo de QR nativo, sin librerías externas de terceros |
| Persistencia | `@react-native-async-storage/async-storage` | Alcanza de sobra para el volumen de datos de una PoC; no hace falta SQLite |
| Exportar | `expo-file-system` + `expo-sharing` | Generar el CSV y abrir el diálogo nativo de "compartir" |
| Feedback táctil | `expo-haptics` | Vibración distinta para éxito / duplicado / error al escanear |
| Iconos | `lucide-react-native` | Set de íconos consistente, sin depender de imágenes sueltas |
| Lenguaje | TypeScript | Tipado del modelo de datos (`Student`, `AttendanceRecord`) |

## Estructura del proyecto

```
app/
  _layout.tsx          # layout raíz, provee el contexto de asistencia
  (tabs)/_layout.tsx    # navegación por tabs (Escanear / Lista)
  (tabs)/index.tsx      # pantalla Scanner
  (tabs)/lista.tsx       # pantalla de lista de asistencia + exportar/reset
components/
  ScanOverlay.tsx        # guía visual de escaneo sobre la cámara
  FeedbackBanner.tsx      # banner de éxito / duplicado / error
  AttendanceRow.tsx       # fila de la lista de asistencia
  EmptyState.tsx           # estado vacío de la lista
lib/
  types.ts               # modelo de datos (Student, AttendanceRecord)
  students.ts              # datos mock de 10 estudiantes de prueba
  storage.ts                # helpers de AsyncStorage
  AttendanceContext.tsx      # estado compartido de asistencia entre pantallas
  theme.ts                    # paleta de colores, tipografía y espaciado
qr-codigos-prueba/
  hoja-para-imprimir.html      # hoja con los 10 QR de prueba + 1 QR inválido
  est-00X.png                    # QR individuales, uno por estudiante mock
```

## Cómo correrlo

Requisitos: Node.js instalado y la app **Expo Go** en el celular (Android o iOS).

```bash
npm install
npx expo start
```

Escaneá el código QR que aparece en la terminal/navegador con la app Expo Go para abrir el proyecto en el celular.

### Probar el escaneo

En `qr-codigos-prueba/hoja-para-imprimir.html` hay 10 códigos QR (uno por estudiante mock) más un código adicional con un id inexistente (`est-999`) para probar el flujo de error. Se puede abrir ese HTML en una laptop/monitor y escanear desde el celular, o imprimirlo.

- Escanear un QR válido por primera vez → banner verde "Asistencia registrada"
- Volver a escanear el mismo QR → banner ámbar "Ya estaba registrado"
- Escanear el QR `est-999` → banner rojo "QR no reconocido"

## Notas de instalación / entorno

- SDK de Expo: 57 (React Native 0.86, React 19.2)
- Probado con `npx expo start` + Expo Go en dispositivo físico (recomendado, ya que el simulador de iOS/Android no siempre expone la cámara)
- Los estudiantes son datos mock definidos en `lib/students.ts` — no hay backend ni base de datos real, es intencional en una PoC
- El registro de asistencia se guarda únicamente en el almacenamiento local del dispositivo (`AsyncStorage`); no hay sincronización entre dispositivos
