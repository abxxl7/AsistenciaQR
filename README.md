# Escáner QR de Asistencia (PoC)

Prueba de concepto para la materia **Tecnologías Emergentes** — Tema 1: *Frameworks de Desarrollo Móvil Multiplataforma (React Native vs. Flutter)*.

## Problema que resuelve

El control de asistencia en clases o eventos universitarios se suele hacer en papel: es lento, alguien puede firmar por otra persona y después hay que pasar todo a digital a mano. Esta app lo resuelve así: la profesora muestra un único código QR (impreso o en su propio celular) y cada alumno lo escanea con **su** celular, completa su nombre y cédula, y confirma. Cada celular solo puede registrar una asistencia, así nadie puede marcar presente a un compañero desde su propio teléfono. Cada registro se envía además a **Firebase Firestore**, y la profesora ve la lista consolidada de asistentes en tiempo real dentro de la app y la puede exportar a Excel.

## Cómo funciona el flujo

1. **Al abrir la app** se revisa si este celular ya tiene una asistencia guardada. Si ya la tiene, va directo a **Confirmación** — ni siquiera se muestra la cámara.
2. **Scanner** — si no hay registro previo, se abre la cámara y espera a que se escanee el QR de la profesora.
3. **Formulario** — tras un escaneo válido, pide nombre completo y cédula. Al confirmar, primero envía el registro (nombre, cédula, sesión y hora) a Firestore (colección `registros`) y, si el envío funciona, lo guarda también localmente. Si falla (por ejemplo sin internet), muestra un error y el alumno puede reintentar sin generar duplicados en Firestore; no queda nada guardado a medias en el celular.
4. **Confirmación** — muestra "✅ Asistencia registrada". Es la misma pantalla que ve el alumno si reabre la app después, y no se puede volver atrás a escanear de nuevo desde ahí (ni con el botón de retroceder del sistema).

## Qué incluye esta PoC

- Escaneo de un único QR de sesión con la cámara del dispositivo (`expo-camera`)
- Formulario de nombre + cédula con validación básica de campos
- Registro enviado a Firestore (`registros`: `sessionId`, `name`, `cedula`, `timestamp`) y guardado localmente — una sola vez por celular
- Pantalla de la profesora (`/profesora`): lista de asistentes en tiempo real (nombre, cédula y hora) con contador, y botón para exportarla a Excel (`.xlsx`) y compartirla por WhatsApp, email, Drive, etc. Se accede con el link "¿Sos la profesora?" en Scanner, en la pantalla de permiso de cámara y en Confirmación
- Bloqueo de un segundo registro desde el mismo dispositivo, incluso reabriendo la app o intentando volver atrás
- Manejo de errores: sin permiso de cámara, QR no reconocido, campos vacíos/inválidos en el formulario, y falla de envío a Firestore (sin conexión)
- Botón de "modo demo" en Confirmación para reiniciar el registro **local** y poder probar el flujo de nuevo sin reinstalar la app (no borra el documento ya enviado a Firestore)

**Fuera de alcance** (a propósito, dado el plazo):

- Autenticación de la profesora: la pantalla `/profesora` es accesible para cualquiera que toque el link
- Login o gestión de usuarios
- Edición manual de registros desde la app
- Backend propio: se usa Firestore como servicio administrado, sin servidor ni Cloud Functions

> **Nota de alcance:** la lista consolidada vive en Firestore (proyecto `asistencia-qr-762a0`, colección `registros`) y se ve en la pantalla `/profesora` o en la consola de Firebase. Como no hay backend propio, la validación del QR y del "una vez por celular" se hace del lado del cliente.

## Cómo se limita a "una vez por celular"

El registro se guarda en `AsyncStorage` bajo una clave fija (`attendance_record`). Que esa clave exista o no **es** el flag de "ya registrado" — no hace falta un booleano aparte. Al abrir la app, o al entrar a la pantalla de Scanner/Formulario, se chequea esa clave antes de habilitar la cámara o el formulario; si ya hay un registro, se redirige directo a Confirmación.

Esto es "una vez por instalación de la app", no un control de hardware — se resetea si el alumno desinstala la app o borra sus datos (o usa el botón de "modo demo"), y en ese caso podría enviar un segundo documento a Firestore. Es un límite razonable y esperable para una PoC: el control se hace en el cliente, sin validar en el servidor.

## Stack técnico

| Pieza | Elección | Por qué |
|---|---|---|
| Framework | Expo (managed workflow) + React Native | Setup inmediato, se prueba en el celular con Expo Go sin configurar Xcode/Android Studio |
| Navegación | `expo-router` (stack de 5 pantallas) | Ruteo basado en archivos, con guardas de navegación por pantalla |
| Cámara / QR | `expo-camera` (`CameraView` + `onBarcodeScanned`) | Escaneo de QR nativo, sin librerías externas de terceros |
| Persistencia local | `@react-native-async-storage/async-storage` | Un único registro por dispositivo; es el flag de "ya registrado" |
| Registro centralizado | Firebase Firestore (`firebase` JS SDK) | Base en la nube administrada, sin servidor propio; la profesora ve todos los registros en un solo lugar |
| Exportar a Excel | `xlsx` (SheetJS) + `expo-file-system` + `expo-sharing` | Genera el `.xlsx` en el celular, lo guarda en la caché y abre el diálogo nativo de compartir |
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
  profesora.tsx               # lista en tiempo real desde Firestore + exportar a Excel
components/
  ScanOverlay.tsx          # guía visual de escaneo sobre la cámara
  FeedbackBanner.tsx         # banner de QR reconocido / no reconocido
lib/
  types.ts                    # modelo de datos (AttendanceRecord, ScanOutcome)
  session.ts                    # valor esperado del QR de la profesora (fijo, embebido en la app)
  firebase.ts                     # inicialización de Firebase y export de la instancia de Firestore (db)
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

## Firebase / Firestore

Los registros se guardan en la colección `registros` con esta forma:

```ts
{ sessionId: string, name: string, cedula: string, timestamp: string /* ISO */ }
```

La **cédula se sincroniza a Firestore** junto con el nombre y la hora (además de guardarse localmente en `AsyncStorage`), porque la profesora la ve en su lista y en el Excel exportado.

La configuración del proyecto está en `lib/firebase.ts`. La `apiKey` de una app web de Firebase es un identificador público (no un secreto), por lo que es seguro subirla al repositorio; lo que protege los datos son las **reglas de seguridad de Firestore**, que se configuran en la consola de Firebase.

Cada envío usa `setDoc` con un ID de documento y un timestamp generados localmente una sola vez (en el primer intento de confirmar). Si el envío da timeout y el alumno reintenta, el segundo envío reescribe el mismo documento, con el mismo timestamp, en vez de crear un duplicado. Por eso las reglas tienen que permitir `create` **y** `update` sobre `registros` (el reintento es un `update` si el primer envío llegó). Reglas usadas en la demo:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /registros/{docId} {
      allow read: if true;
      allow create: if true;
      allow update: if request.resource.data.sessionId == resource.data.sessionId;
    }
  }
}
```

El `update` solo se permite si no cambia el `sessionId`. Son reglas de PoC: `read` y `create` están abiertos, así que cualquiera con los datos del proyecto (que están en `lib/firebase.ts`) puede leer la lista de nombres **y cédulas** (datos personales) o crear documentos falsos; en una versión real habría autenticación (incluida la de la profesora) o validación en el servidor, y no se guardarían cédulas con lectura pública. El "modo de prueba" que ofrece Firebase al crear la base deja todo abierto y vence a los 30 días; conviene reemplazarlo por reglas como las de arriba.

## Notas de instalación / entorno

- SDK de Expo: 57 (React Native 0.86, React 19.2)
- Probado con `npx expo start` + Expo Go en dispositivo físico (recomendado, ya que el simulador de iOS/Android no siempre expone la cámara)
- Requiere conexión a internet para registrar la asistencia (el envío a Firestore se intenta primero, con un timeout de 10 segundos)
- Si `npm install` falla con un conflicto de peer dependencies (`react-dom`), usar `npm install --legacy-peer-deps`
- El valor esperado del QR de la profesora está fijo en `lib/session.ts` (`TE-2026-clase1`) — en una versión completa vendría del servidor y cambiaría por clase/sesión
