import { useContext } from "react";
import { Oval } from "react-loader-spinner";
import { LoaderContext } from "./loadercontext";
import ReactLoading from "react-loading";
const THEME_DARK_BLUE = "#347dc1";

// Can be a string as well. Need to ensure each key-value pair ends with ;

function Loaders() {
  const { loading } = useContext(LoaderContext);

  return (
    <>
      {loading && (
        <div className="w-100 d-flex justify-content-center mt-4">
         
              <ReactLoading
                type={"bars"}
                color={THEME_DARK_BLUE}
                height={"10%"}
                width={"6%"}
              />
       
        </div>
      )}
    </>
  );
}

export default Loaders;
