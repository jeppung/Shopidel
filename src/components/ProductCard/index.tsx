import React, { MouseEventHandler } from "react";
import classNames from "classnames";
import { BsStarFill } from "react-icons/bs";
import Image from "next/image";

interface IProductCard {
  image: string;
  price: number;
  order: number;
  title: string;
  place: string;
  star?: number;
  onClick?: MouseEventHandler;
}
const ProductCard = ({
  image,
  price,
  order,
  title,
  place,
  star,
  onClick,
}: IProductCard) => {
  return (
    <div
      onClick={onClick}
      className={classNames([
        "w-[160px] h-[220px] md:w-auto md:h-auto bg-white my-3 shadow-md hover:shadow-none cursor-pointer rounded-md flex flex-col items-center align-middle justify-center transition-all duration-500 ease-in-out text-left",
      ])}
    >
      <div className={"relative w-[200px ] md mt-2 mx-2"}>
        <div className={"rounded-md h-auto md:h-48 w-auto overflow-hidden"}>
          <Image
            width={100}
            height={100}
            src={image}
            className={"object-cover w-full md:w-full h-auto md:h-full "}
            alt=""
          />
        </div>
        <div className={"absolute bottom-0 left-0 -mb-4 ml-3 flex flex-row"}>
          <div
            className={classNames(
              "h-10 w-fit px-2 flex items-center justify-center text-sm bg-white hover:shadow-none text-[#f57b29]  rounded-2xl shadow-xl"
            )}
          >
            <BsStarFill />
            <span
              className={classNames(
                "text-gray-500 ml-2 group-hover:text-white"
              )}
            >
              {star}
            </span>
          </div>
        </div>
      </div>
      <div className="pt-3 pb-3 md:pt-10  md:pb-6 w-full px-4 ">
        <p className=" tracking-wider text-black text-sm md:text-base">
          {title.length > 18 ? `${title.substring(0, 30)}...` : title}{" "}
        </p>
        <p className=" tracking-wider text-[#f57b29] text-sm md:text-base">{`Rp. ${price}`}</p>{" "}
        <div className="flex justify-between text-xs md:text-sm">
          <p> {place} </p>
          <p className="text-gray-500 "> {`${order} sold`}</p>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
