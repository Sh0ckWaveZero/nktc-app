import type { NextPage } from "next";
import Dashboard from "./dashboard";
import { useEffect, useState } from "react";
import Layout from "@/components/Layouts/Layout";

const Home: NextPage = () => {
  const [users, setUsers] = useState<any[]>([]);

  useEffect(() => {
    // userService.getAll().then(x => setUsers(x));
  }, []);

  return (
    <Layout>
      <Dashboard />
    </Layout>
  );
};

export default Home;
