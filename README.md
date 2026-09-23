# Escáner QR de Asistencia (PoC)

Prueba de concepto para la materia **Tecnologías Emergentes** — Tema 1: *Frameworks de Desarrollo Móvil Multiplataforma (React Native vs. Flutter)*.

## Problema que resuelve

El control de asistencia en clases o eventos universitarios se suele hacer en papel: es lento, alguien puede firmar por otra persona y después hay que pasar todo a digital a mano. Esta app lo resuelve así: la profesora muestra un único código QR (impreso o en su propio celular) y cada alumno lo escanea con **su** celular, completa su nombre y cédula, y confirma. Cada celular solo puede registrar una asistencia, así nadie puede marcar presente a un compañero desde su propio teléfono.

## Cómo funciona el flujo

1. **Al abrir la app** se revisa si este celular ya tiene una asistencia guardada. Si ya la tiene, va directo a **Confirmación** — ni siquiera se muestra la cámara.
2. **Scanner** — si no hay registro previo, se abre la cámara y espera a que se escanee el QR de la profesora.
3. **Formulario** — tras un escaneo válido, pide nombre completo y cédula.
4. **Confirmación** — al confirmar, guarda el registro localmente y muestra "✅ Asistencia registrada". Es la misma pantalla que ve el alumno si reabre la app después, y no se puede volver atrás a escanear de nuevo desde ahí (ni con el botón de retroceder del sistema).

## Qué incluye esta PoC

- Escaneo de un único QR de sesión con la cámara del dispositivo (`expo-camera`)
- Formulario de nombre + cédula con validación básica de campos
- Registro guardado localmente (nombre, cédula, hora) — una sola vez por celular
- Bloqueo de un segundo registro desde el mismo dispositivo, incluso reabriendo la app o intentando volver atrás
- Manejo de errores: sin permiso de cámara, QR no reconocido, campos vacíos/ inválidos en el formulario
- Botón de "modo demo" en Confirmación para reiniciar el registro y poder probar el flujo de nuevo sin reinstalar la app

**Fuera de alcance** (a propósito, dado el plazo y por tratarse de una PoC sin backend):

- Backend / servidor / lista centralizada que la profesora vea en tiempo real
- Login o gestión de usuarios
- Edición manual de registros desde la app

> **Nota de alcance:** al no haber backend, cada celular guarda solo *su propio* registro — no existe una lista consolidada que la profesora vea en vivo. Para la demo, cada alumno muestra su pantalla de Confirmación como comprobante. Consolidar todo en un solo lugar ya requeriría un backend, que queda fuera de esta PoC pero se puede mencionar como paso futuro.

## Cómo se limita a "una vez por celular"

El registro se guarda en `AsyncStorage` bajo una clave fija (`attendance_record`). Que esa clave exista o no **es** el flag de "ya registrado" — no hace falta un booleano aparte. Al abrir la app, o al entrar a la pantalla de Scanner/Formulario, se chequea esa clave antes de habilitar la cámara o el formulario; si ya hay un registro, se redirige directo a Confirmación.

Esto es "una vez por instalación de la app", no un control de hardware — se resetea si el alumno desinstala la app o borra sus datos (o usa el botón de "modo demo"). Es un límite razonable y esperable para una PoC sin backend.

## Stack técnico

| Pieza | Elección | Por qué |
|---|---|---|
| Framework | Expo (managed workflow) + React Native | Setup inmediato, se prueba en el celular con Expo Go sin configurar Xcode/Android Studio |
| Navegación | `expo-router` (stack de 4 pantallas) | Ruteo basado en archivos, con guardas de navegación por pantalla |
| Cámara / QR | `expo-camera` (`CameraView` + `onBarcodeScanned`) | Escaneo de QR nativo, sin librerías externas de terceros |
| Persistencia | `@react-native-async-storage/async-storage` | Un único registro por dispositivo; no hace falta una base de datos |
| Feedback táctil | `expo-haptics` | Vibración distinta para QR reconocido / no reconocido |
| Iconos | `lucide-react-native` | Set de íconos consistente, sin depender de imágenes sueltas |
| Lenguaje | TypeScript | Tipado del modelo de datos (`AttendanceRecord`) |

## Estructura del proyecto

```
app/
  _layout.tsx        # layout raíz (stack sin headers), provee el contexto de asistencia
  index.tsx           # pantalla "gate": decide Scanner o Confirmación según AsyncStorage
  scanner.tsx           # escaneo del QR único de la profesora
  formulario.tsx          # nombre + cédula, tras un escaneo válido
  confirmacion.tsx          # estado final, no permite volver a escanear
components/
  ScanOverlay.tsx          # guía visual de escaneo sobre la cámara
  FeedbackBanner.tsx         # banner de QR reconocido / no reconocido
lib/
  types.ts                    # modelo de datos (AttendanceRecord, ScanOutcome)
  session.ts                    # valor esperado del QR de la profesora (fijo, sin backend)
  storage.ts                      # helpers de AsyncStorage (get/save/clear del registro)
  AttendanceContext.tsx             # estado compartido de asistencia entre pantallas
  theme.ts                            # paleta de colores, tipografía y espaciado
qr-codigos-prueba/
  qr-sesion-profesora.png               # el QR "de la profesora" para probar el flujo válido
  qr-invalido.png                         # un QR que no corresponde a la clase, para probar el error
  hoja-para-imprimir.html                   # los dos QR juntos, listos para mostrar en pantalla o imprimir
```

## Cómo correrlo

Requisitos: Node.js instalado y la app **Expo Go** en el celular (Android o iOS).

```bash
npm install
npx expo start
```

Escaneá el código QR que aparece en la terminal/navegador con la app Expo Go para abrir el proyecto en el celular.

### Probar el flujo completo

En `qr-codigos-prueba/hoja-para-imprimir.html` están los dos QR de prueba. Se puede abrir ese HTML en una laptop/monitor y escanear desde el celular, o imprimirlo.

1. Escaneá `qr-invalido.png` → banner rojo "QR no reconocido"
2. Escaneá `qr-sesion-profesora.png` → banner verde "QR reconocido" y pasa al formulario
3. Completá nombre y cédula, confirmá → pantalla de Confirmación
4. Cerrá la app y volvé a abrirla → tiene que ir directo a Confirmación, sin dejarte escanear de nuevo
5. Con la app abierta, intentá volver atrás desde Confirmación → te vuelve a mandar a Confirmación en vez de dejarte entrar al Scanner

Para repetir la prueba desde cero sin reinstalar, usá el botón "Borrar mi registro y volver a escanear" al final de la pantalla de Confirmación (pensado solo para hacer demos/pruebas).

## Notas de instalación / entorno

- SDK de Expo: 57 (React Native 0.86, React 19.2)
- Probado con `npx expo start` + Expo Go en dispositivo físico (recomendado, ya que el simulador de iOS/Android no siempre expone la cámara)
- El valor esperado del QR de la profesora está fijo en `lib/session.ts` (`TE-2026-clase1`) — en una versión real con backend, ese valor vendría del servidor y cambiaría por clase/sesión
- El registro de asistencia se guarda únicamente en el almacenamiento local del dispositivo (`AsyncStorage`); no hay sincronización entre dispositivos ni lista centralizada
