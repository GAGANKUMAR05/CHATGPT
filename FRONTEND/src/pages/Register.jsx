import { useContext } from "react";
import { AuthContext } from "../context/authContext.jsx";
import { useNavigate } from "react-router-dom";
import  {register}  from '../api/api.jsx'

const Register = () => {
    
    const { email, setEmail,firstname,setFirstname,lastname,setLastname,password,setPassword} = useContext(AuthContext);
    const navigate = useNavigate()
    const handleSubmit = async (e)=>{
        e.preventDefault();
        if(!email || !firstname || !lastname || !password)
        {
            alert("Enter valid details")
            return;
        }
        try{
            await register(email,firstname,lastname,password)
            alert("user register successfully")
            navigate("/login")
        }catch(err){
            alert("user could not be registered")
            console.log(err)
        }
    }
  return (
    <main className="min-h-dvh flex flex-col items-center justify-center">
      
      <h1 className="text-3xl font-bold mb-6">
        Register
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
          <label htmlFor="firstname">First Name</label>
          <input
            type="text"
            name="firstname"
            id="firstname"
            placeholder="Enter your first name"
            className="border rounded-md px-3 py-2"
            value={firstname}
            onChange={(e)=>{setFirstname(e.target.value.trim())}}
          />
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="lastname">Last Name</label>
          <input
            type="text"
            name="lastname"
            id="lastname"
            placeholder="Enter your last name"
            className="border rounded-md px-3 py-2"
            value={lastname}
            onChange={(e)=>{setLastname(e.target.value.trim())}}
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
          Create Account
        </button>

      </form>
    </main>
  )
}

export default Register

