import React, { useState } from "react";

export const LoaderContext = React.createContext();
export const LoaderProvider = (props) => {
  let [loading, setLoading] = useState(false);

  return (
    <LoaderContext.Provider
      value={{
        loading: loading,
        setLoading: setLoading,
      }}
    >
      {props.children}
    </LoaderContext.Provider>
  );
};
