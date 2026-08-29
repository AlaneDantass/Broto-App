import React from "react";
import { IMAGE_MARKDOWN_REGEX } from "../utils/imagePaste";

interface DescricaoTextoProps {
  texto?: string | null;
  className?: string;
}

/** Exibe um texto salvo por um TextareaComImagens, renderizando as imagens coladas. */
export const DescricaoTexto: React.FC<DescricaoTextoProps> = ({ texto, className }) => {
  if (!texto) return null;

  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let key = 0;

  const regex = new RegExp(IMAGE_MARKDOWN_REGEX.source, "g");
  let match: RegExpExecArray | null;

  while ((match = regex.exec(texto)) !== null) {
    if (match.index > lastIndex) {
      parts.push(
        <span key={key++} className="whitespace-pre-wrap">
          {texto.slice(lastIndex, match.index)}
        </span>
      );
    }
    parts.push(
      <img
        key={key++}
        src={match[1]}
        alt="Imagem colada"
        className="max-w-full rounded-lg my-2 block"
      />
    );
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < texto.length) {
    parts.push(
      <span key={key++} className="whitespace-pre-wrap">
        {texto.slice(lastIndex)}
      </span>
    );
  }

  return <div className={className}>{parts}</div>;
};
