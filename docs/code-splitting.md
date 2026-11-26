# Code-splitting: bundle inicial

## Metodología

Se construyó la aplicación en modo producción y se midió la ruta inicial con Chromium. El script `scripts/measure-initial-bundle.mjs` suma el JavaScript solicitado durante la carga inicial y sus primeros 250 ms, comprime cada archivo con gzip y calcula el total. Los tamaños en kB son decimales (1 kB = 1.000 bytes).

## Resultado

| Medición          |          JavaScript raw |    JavaScript gzip |
| ----------------- | ----------------------: | -----------------: |
| Antes (`9b55143`) |           789.971 bytes |          236,31 kB |
| Después           |           646.520 bytes |          194,94 kB |
| Reducción         | 143.451 bytes (18,16 %) | 41,37 kB (17,51 %) |

El bundle inicial queda por debajo del presupuesto estricto de 200 kB gzip. Las vistas secundarias y sus mutaciones se cargan al necesitarlas; el dashboard conserva la navegación SPA. También se reemplazaron los imports de `date-fns` del dashboard por funciones pequeñas de fecha local, evitando incluir ese código en la carga inicial.

Para repetir la medición después de `npm run build`, ejecuta `npm run analyze:bundle`. El comando falla si el total es igual o superior a 200 kB gzip.
