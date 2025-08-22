import Guest from "@/components/Guest"
import { currentUser } from "@clerk/nextjs/server"
const HomePage = async() => {
  const user=await currentUser()
  if (!user){
    return <Guest/>
  }
  return (
    <div className='bg-red-700' >
      home
    </div>
  )
}

export default HomePage
