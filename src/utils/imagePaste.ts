// Suporte a colar imagens (Ctrl+V) em campos de descrição/texto.
// As imagens são convertidas em data URLs e embutidas como markdown simples
// (`![imagem](data:...)`) dentro do próprio texto, sem depender de upload
// para um servidor externo.

const IMAGE_MARKDOWN_REGEX = /!\[imagem\]\((data:image\/[^)]+)\)/g;

const MAX_IMAGE_WIDTH = 1000;
const JPEG_QUALITY = 0.82;

function readFileAsDataUrl(file: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

/** Redimensiona/comprime a imagem colada para não inflar o texto salvo. */
export function resizeImageFile(file: Blob): Promise<string> {
  return readFileAsDataUrl(file).then(
    (dataUrl) =>
      new Promise<string>((resolve) => {
        const img = new Image();
        img.onload = () => {
          const scale = Math.min(1, MAX_IMAGE_WIDTH / img.width);
          const width = Math.round(img.width * scale);
          const height = Math.round(img.height * scale);
          const canvas = document.createElement("canvas");
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          if (!ctx) {
            resolve(dataUrl);
            return;
          }
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL("image/jpeg", JPEG_QUALITY));
        };
        img.onerror = () => resolve(dataUrl);
        img.src = dataUrl;
      })
  );
}

/** Extrai um arquivo de imagem de um evento de paste, se houver. */
export function getImageFromClipboard(
  clipboardData: DataTransfer | null
): File | null {
  if (!clipboardData) return null;
  const item = Array.from(clipboardData.items).find((i) =>
    i.type.startsWith("image/")
  );
  return item?.getAsFile() ?? null;
}

/** Separa o texto "limpo" (para exibir/editar) das imagens embutidas nele. */
export function extractImagesFromText(texto: string | null | undefined): {
  cleanText: string;
  images: string[];
} {
  if (!texto) return { cleanText: "", images: [] };

  const images: string[] = [];
  const cleanText = texto
    .replace(IMAGE_MARKDOWN_REGEX, (_match, url: string) => {
      images.push(url);
      return "";
    })
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  return { cleanText, images };
}

/** Recombina o texto digitado com as imagens coladas, pronto para salvar. */
export function buildTextWithImages(texto: string, images: string[]): string {
  const trimmed = texto.trim();
  if (images.length === 0) return trimmed;

  const imagesMarkdown = images.map((src) => `![imagem](${src})`).join("\n");
  return trimmed ? `${trimmed}\n\n${imagesMarkdown}` : imagesMarkdown;
}

export { IMAGE_MARKDOWN_REGEX };
