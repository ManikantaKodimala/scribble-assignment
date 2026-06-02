interface LobbyStatusProps {
  pollError: string | null;
}

export function LobbyStatus({ pollError }: LobbyStatusProps) {
  if (!pollError) {
    return null;
  }

  return (
    <div className="form__error" style={{ marginBottom: "12px", textAlign: "center" }}>
      {pollError}
    </div>
  );
}
