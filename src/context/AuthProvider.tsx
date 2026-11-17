import { onAuthStateChanged, signOut, User } from "firebase/auth";
import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from "react";

// Adaptez ce chemin à l'emplacement de votre fichier firebase.ts
import { auth } from "@/storage/firebase";

type AuthContextValue = {
  /** Utilisateur connecté, ou null. */
  user: User | null;
  /** true tant que Firebase n'a pas restauré (ou non) la session au lancement de l'app. */
  isLoading: boolean;
  logOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Appelé au lancement (session restaurée depuis AsyncStorage), puis à chaque connexion/déconnexion
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setIsLoading(false);
    });
    return unsubscribe;
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({ user, isLoading, logOut: () => signOut(auth) }),
    [user, isLoading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth doit être utilisé à l'intérieur d'un AuthProvider.");
  }
  return context;
}