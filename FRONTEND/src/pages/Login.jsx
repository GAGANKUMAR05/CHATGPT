import { useContext } from "react";
import { AuthContext } from "../context/authContext.jsx";
import { useNavigate } from "react-router-dom";
import { login } from "../api/api.jsx";

const Login = () => {
  const navigate = useNavigate()
  const {email,setEmail,password,setPassword} = useContext(AuthContext)

  const handleSubmit = async (e)=>{
    e.preventDefault();
    if(!email ||  !password)
            {
                alert("Enter valid details")
                return;
            }
            try{
                await login(email,password)
                alert("user logged in successfully")
                navigate("/")
            }catch(err){
                alert(err)
                
            }

  }
  return (
    <main className="min-h-dvh flex flex-col items-center justify-center">
      
    <h1 className="text-3xl font-bold mb-6">
      Login
    </h1>

    <form className="flex flex-col w-80 gap-4" onSubmit={handleSubmit}>

      <div className="flex flex-col gap-1">
        <label htmlFor="email">Email</label>
        <input
          type="email"
          name="email"
          id="email"
          placeholder="Enter your email"
          className="border rounded-md px-3 py-2"
          value={email}
          onChange={(e)=>{setEmail(e.target.value.trim())}}
        />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="password">Password</label>
        <input
          type="password"
          name="password"
          id="password"
          placeholder="Enter your password"
          className="border rounded-md px-3 py-2"
          value={password}
          onChange={(e)=>{setPassword(e.target.value)}}
        />
      </div>

      <button
        type="submit"
        className="
         bg-black
         text-white
         py-2
          rounded-md
          transition-all
          duration-300
        hover:bg-gray-700
          hover:scale-105
"  
     
      >
        Login
      </button>

    </form>
  </main>
  )
}

export default Login
