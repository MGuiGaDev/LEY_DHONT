# Revisión a la aplicación "Simulador de la ley D'Hont" - Una propuesta de solución

## Descripción de la vista y su funcionalidad

- Aplicación que permite al usuario introducir datos sobre votaciones (escaños, partidos -nombre y votos), con la finalidad de obtener el resultado del cálculo de los mismos en base a la Ley D'Hont.
- La entrada de datos se presenta en un grupo de un elemento (escaños) y en múltiples grupos de 2 elementos (partidos).
  - Por defecto existe un partido.
  - Pueden añadirse y eliminarse partidos.
- Los datos serán recogidos cuando exista un mínimo de 2 partidos y estén introducidos los datos de escaños:
  - Deben ser validados:
    - Ningún dato puede ser null.
    - Escaños: debe ser un número mayor a 3 e impar.
    - Partidos: el nombre del partido debe tener una longitud superior a 3 caracteres y el número de votos del partido debe ser 0 o mayor a 0 y un número entero.
  - Generan nuevos datos que serán presentados de 3 formas distintas:
    - Resultado porcentual de escaños.
    - Resultado de las votaciones visualizado en un gráfico.
    - Pactómetro que permite operar con posibles pactos entre partidos para alcanzar la mayoría absoluta.

## Mejoras requeridas

- Mejora del estilo de la vista.
- Generar documentación.

## Mejoras adicionales

- Control exahustivo de la entrada de datos numéricos: [keyNoAllowed](js/dhont.js#L31), [Listener para evento "keypress"](js/dhont.js#L47) y [clearPlaceHolder](js/dhont.js#L107).
- Refactorización del código tratando de desacoplar las funciones.

### Propuesta de refactorización

Implementación de una especie de ¿"función-interfaz"? [runDhont](js/dhont.js#L165) que invoca a gran número de funciones, pasando de trabajar con parámetros a trabajar con variables globales. Además, esto ha hecho posible la corrección del error producido por la actualización del gráfico con nuevos cálculos.
