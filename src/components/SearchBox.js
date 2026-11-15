"use client";
import Form from "next/form";
import { useSearchParams } from "next/navigation";

export default function SearchBox() {
  const q = useSearchParams().get("q") ?? "";
  return (
    <Form action="/search" className="max-w-md">
      <input
        key={q}
        name="q"
        defaultValue={q}
        placeholder="Search movies, series, people…"
        className="input"
        aria-label="Search"
      />
    </Form>
  );
}
