import { PropsWithChildren } from "react";
import { Spectrum } from "../../types";

interface Props {
  remove: () => void;
}

export default function SpectrumForm({
  remove,
  children,
}: PropsWithChildren<Props>) {
  return (
    <div>
      {children}
      <span className="link" onClick={remove}>
        Delete
      </span>
    </div>
  );
}
