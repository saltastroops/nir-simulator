import { PropsWithChildren } from "react";

interface Props {
  remove: () => void;
}

export default function SpectrumForm({
  remove,
  children,
}: PropsWithChildren<Props>) {
  return (
    <div className="relative border border-gray-200 p-2 mt-3">
      <div
        className="absolute top-0 right-0 translate-x-1/2 -translate-y-1/2 border border-red-500 rounded-full bg-red-500 text-white w-6 h-6 flex justify-center items-center cursor-pointer"
        onClick={remove}
      >
        <div>
          <i className="fa-solid fa-xmark"></i>
        </div>
      </div>
      {children}
    </div>
  );
}
