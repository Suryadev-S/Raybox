import axios from "axios";
import { headers } from "next/headers";

const RayboxHome = async () => {
  let resource: any | null = null;
  try {
    const res = await axios.get('http://localhost:3000/api/raybox', {
      headers: {
        'Cookie': (await headers()).get("cookie") ?? '',
      },
    });
    if (res.status != 200) {
      console.error('Error in the api');
      throw new Error;
    }

    resource = res.data;
    console.log(resource);
  } catch (error) {
    console.error(error);
  }
  return (
    <div>
      Raybox home
    </div>
  );
};

export default RayboxHome;