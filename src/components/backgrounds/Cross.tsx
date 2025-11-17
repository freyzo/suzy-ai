interface CrossProps {
  children?: React.ReactNode;
}

export default function Cross({ children }: CrossProps) {
  return (
    <div className="cross-background-container">
      {children}
    </div>
  );
}

