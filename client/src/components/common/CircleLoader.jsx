import { Circles } from "react-loader-spinner";

const CircleLoader = ({ size = 30 }) => {
  return (
    <div className="circleLoader">
      <Circles
        height={size}
        width={size}
        color="#007bff"
        ariaLabel="circles-loading"
        wrapperStyle={{}}
        wrapperClass=""
        visible={true}
      />
    </div>
  );
};

export default CircleLoader;
