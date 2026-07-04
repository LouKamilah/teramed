const SUPABASE_URL = "https://dojjvyardgouoncwjdec.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_FsfqxgXDhOlTzyduxs5CXQ_vbxdXzZA";
const WHATSAPP_NUMBER = "56934009434";

document.addEventListener("alpine:init", () => {
  Alpine.data("catalogo", () => ({
    categorias: [],
    productos: [],
    categoriaActiva: "todos",
    busqueda: "",
    orden: "nombre",
    cargando: true,
    error: null,

    async init() {
      const client = window.supabase.createClient(
        SUPABASE_URL,
        SUPABASE_ANON_KEY,
      );

      try {
        const [
          { data: categorias, error: errCat },
          { data: productos, error: errProd },
        ] = await Promise.all([
          client.from("categoria").select("*").order("nombre"),

          client
            .from("productos")
            .select(
              `
                                *,
                                categoria(
                                    id,
                                    nombre,
                                    slug
                                )
                            `,
            )
            .eq("activo", true)
            .order("nombre"),
        ]);

        if (errCat || errProd) throw errCat || errProd;

        this.categorias = categorias ?? [];
        this.productos = productos ?? [];
      } catch (e) {
        console.error(e);
        this.error = "No se pudo cargar el catálogo.";
      } finally {
        this.cargando = false;
      }
    },

    get productosFiltrados() {
      let lista = [...this.productos];

      if (this.categoriaActiva !== "todos") {
        lista = lista.filter((p) => p.categoria?.slug === this.categoriaActiva);
      }

      if (this.busqueda.trim() !== "") {
        const b = this.busqueda.toLowerCase();

        lista = lista.filter(
          (p) =>
            p.nombre.toLowerCase().includes(b) ||
            p.descripcion.toLowerCase().includes(b),
        );
      }

      switch (this.orden) {
        case "precioAsc":
          lista.sort((a, b) => a.precio - b.precio);
          break;

        case "precioDesc":
          lista.sort((a, b) => b.precio - a.precio);
          break;

        default:
          lista.sort((a, b) => a.nombre.localeCompare(b.nombre));
      }

      return lista;
    },

    precio(valor) {
      return new Intl.NumberFormat("es-CL", {
        style: "currency",
        currency: "CLP",
        maximumFractionDigits: 0,
      }).format(valor);
    },

    linkWhatsapp(nombre) {
      return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
        `¡Hola! Deseo cotizar ${nombre}`,
      )}`;
    },
  }));
});
