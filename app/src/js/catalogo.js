// =========================================================
// TeraMED · Catálogo dinámico (Supabase + Alpine.js)
// =========================================================

const SUPABASE_URL = "https://dojjvyardgouoncwjdec.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_FsfqxgXDhOlTzyduxs5CXQ_vbxdXzZA";
const WHATSAPP_NUMBER = "56934009434";

document.addEventListener("alpine:init", () => {
  Alpine.data("catalogo", () => ({
    categorias: [],
    productos: [],
    categoriaActiva: "todos",
    cargando: true,
    error: null,

    async init() {
      try {
        const client = window.supabase.createClient(
          SUPABASE_URL,
          SUPABASE_ANON_KEY,
        );

        const [
          { data: categorias, error: errCat },
          { data: productos, error: errProd },
        ] = await Promise.all([
          client.from("categoria").select("*").order("nombre"),
          client
            .from("productos")
            .select("*, categoria(nombre, slug)")
            .eq("activo", true)
            .order("nombre"),
        ]);

        if (errCat || errProd) throw errCat || errProd;

        this.categorias = categorias || [];
        this.productos = productos || [];
      } catch (e) {
        console.error("Error cargando catálogo desde Supabase:", e);
        this.error = "No pudimos cargar el catálogo en este momento.";
      } finally {
        this.cargando = false;
      }
    },

    // Lista filtrada según la categoría seleccionada
    get productosFiltrados() {
      if (this.categoriaActiva === "todos") return this.productos;
      return this.productos.filter(
        (p) => p.categoria?.slug === this.categoriaActiva,
      );
    },

    // Arma el link de WhatsApp con el mensaje ya redactado
    linkWhatsapp(nombreProducto) {
      const mensaje = `¡Hola, quisiera cotizar ${nombreProducto}!`;
      return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(mensaje)}`;
    },
  }));
});
