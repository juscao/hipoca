import { useEffect, useState } from "react";
import { createBrowserRouter, RouterProvider } from "react-router";
import {
  AllDecks,
  Cards,
  Create,
  Dashboard,
  Deck,
  Explore,
  Flashcard,
  Footer,
  Home,
  Navbar,
  NotFound,
  Review,
  Session,
  SignIn,
  SignUp,
  Study,
  Unauthorized,
} from "./components";
import { UserContext } from "./contexts/UserContext";
import { verifyUser } from "./services/authApi";
import { User } from "./types/auth.types";

function App() {
  const [currentUser, setCurrentUser] = useState<User | undefined>();
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    const getUser = async () => {
      try {
        const user = await verifyUser();
        if (user) {
          setCurrentUser(user);
        }
        setFetching(false);
        return;
      } catch (error) {
        console.log(error);
      }
    };
    getUser();
  }, []);

  const setUser = (user: User) => {
    setCurrentUser(user);
    return;
  };

  const router = createBrowserRouter([
    { path: "/", element: <Home /> },
    { path: "/home", element: <Home /> },
    { path: "/dashboard", element: <Dashboard /> },
    { path: "/study", element: <Study /> },
    { path: "/create", element: <Create /> },
    {
      path: "/cards/:cardId",
      element: currentUser ? <Flashcard /> : <Unauthorized />,
    },
    {
      path: "/cards/all",
      element: currentUser ? <Cards /> : <SignIn setUser={setUser} />,
    },
    {
      path: "/cards/new",
      element: currentUser ? <Flashcard /> : <SignIn setUser={setUser} />,
    },
    {
      path: "/decks/:deckId",
      element: currentUser ? <Cards /> : <Unauthorized />,
    },
    {
      path: "/decks/:deckId/edit",
      element: currentUser ? <Deck /> : <Unauthorized />,
    },
    {
      path: "/decks/all",
      element: currentUser ? <AllDecks /> : <SignIn setUser={setUser} />,
    },
    {
      path: "/decks/new",
      element: currentUser ? <Deck /> : <SignIn setUser={setUser} />,
    },
    {
      path: "/study/due_for_review",
      element: currentUser ? <Review /> : <SignIn setUser={setUser} />,
    },
    {
      path: "/study/current_stack",
      element: currentUser ? <Review /> : <SignIn setUser={setUser} />,
    },
    {
      path: "/study/deck/:deckId",
      element: currentUser ? <Review /> : <SignIn setUser={setUser} />,
    },
    {
      path: "/study/session/:sessionId",
      element: currentUser ? <Session /> : <SignIn setUser={setUser} />,
    },
    {
      path: "/explore",
      element: currentUser ? <Explore /> : <SignIn setUser={setUser} />,
    },
    {
      path: "/sign_in",
      element: <SignIn setUser={setUser} />,
    },
    {
      path: "/sign_up",
      element: <SignUp setUser={setUser} />,
    },
    { path: "*", element: <NotFound /> },
  ]);

  return (
    <>
      {!fetching && (
        <UserContext.Provider value={currentUser}>
          <Navbar />
          <RouterProvider router={router} />
          <Footer />
        </UserContext.Provider>
      )}
    </>
  );
}

export default App;
