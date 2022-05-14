import type { NextPage } from "next";
import Auth from "../components/auth";
import Dashboard from "../components/dashboard";
import { useEffect, useState } from "react";
import { userService } from "../services";

const Home: NextPage = () => {

  const [users, setUsers] = useState<any[]>([]);

  useEffect(() => {
    // userService.getAll().then(x => setUsers(x));
  }, []);

  return (
    <div>
      <button >

      </button>
    </div>
    // <div className="card mt-4">
    //   <h4 className="card-header">You're logged in with Next.js 12 & JWT!!</h4>
    //   <div className="card-body">
    //     <h6>Users from secure api end point</h6>
    //     {users &&
    //       <ul>
    //         {users.map(user =>
    //           <li key={user.id}>{user.firstName} {user.lastName}</li>
    //         )}
    //       </ul>
    //     }
    //     {!users && <div className="spinner-border spinner-border-sm"></div>}
    //   </div>
    // </div>
  );
};

export default Home;
