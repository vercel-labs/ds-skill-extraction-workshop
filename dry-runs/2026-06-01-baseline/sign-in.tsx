"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/ds/components/Button";
import { TextInput } from "@/ds/components/TextInput";
import { FormControl } from "@/ds/components/FormControl";

export default function SignInPage() {
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);
    try {
      // Wire up to your auth endpoint here.
      await new Promise((resolve) => setTimeout(resolve, 500));
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main style={{ maxWidth: 360, margin: "4rem auto", padding: "0 1rem" }}>
      <h1>Sign in</h1>
      <form
        onSubmit={handleSubmit}
        style={{ display: "grid", gap: "1rem", marginTop: "1.5rem" }}
      >
        <FormControl>
          <FormControl.Label>Email</FormControl.Label>
          <TextInput
            name="email"
            type="email"
            autoComplete="email"
            required
          />
        </FormControl>

        <FormControl>
          <FormControl.Label>Password</FormControl.Label>
          <TextInput
            name="password"
            type="password"
            autoComplete="current-password"
            required
          />
        </FormControl>

        <Button type="submit" variant="primary" disabled={isLoading}>
          {isLoading ? "Signing in…" : "Sign in"}
        </Button>
      </form>
    </main>
  );
}
