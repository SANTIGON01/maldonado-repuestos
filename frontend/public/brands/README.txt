LOGOS DE MARCAS - Maldonado Repuestos
=====================================

Colocar los logos de las marcas en esta carpeta con los siguientes nombres:

- bpw.png
- meritor.png
- wabco.png
- jost.png
- saf.png
- haldex.png
- randon.png
- hella.png
- bendix.png
- knorr.png
- fruehauf.png
- krone.png

RECOMENDACIONES:
- Formato: PNG con fondo transparente (preferido) o JPG con fondo blanco
- Tamaño: Entre 200x80 y 400x150 píxeles
- Los logos se mostrarán en escala de grises y al pasar el mouse se ven en color
- Si no existe el logo, se muestra el nombre de la marca como texto

AGREGAR NUEVAS MARCAS:
Editar el archivo frontend/src/components/Features.jsx y agregar a la lista:
{ name: 'NUEVA_MARCA', logo_url: '/brands/nueva_marca.png' }
