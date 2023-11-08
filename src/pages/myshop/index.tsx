import Button from "@/components/Button";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import {
  IAPIResponse,
  IAPIUserProfileResponse,
} from "@/interfaces/api_interface";
import { ICourier } from "@/interfaces/courier_interface";
import { IAddress } from "@/interfaces/user_interface";
import { API } from "@/network";
import { useUserStore } from "@/store/userStore";
import axios from "axios";
import { getCookie } from "cookies-next";
import React, { useEffect, useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { BsCheck } from "react-icons/bs";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

interface IRegisterMerchant {
  shop_name: string;
  address_id: number;
  list_courier_id: number[];
}

const MyShop = () => {
  return <RegisterShop />;
};

const RegisterShop = () => {
  const {
    register,
    handleSubmit,
    setValue,
    getValues,
    formState: { errors },
  } = useForm<IRegisterMerchant>({
    defaultValues: {
      list_courier_id: [],
    },
  });
  const { user } = useUserStore();
  const [logged, setLogged] = useState<IAPIUserProfileResponse>();
  const [listAddress, setListAddress] = useState<IAddress[]>();
  const [listCourier, setListCourier] = useState<ICourier[]>();
  const [isDropdownCourier, setIsDropdownCourier] = useState<boolean>(false);
  const [selectedCourier, setSelectedCourier] = useState<number[]>([]);

  const registerMerchantHandler: SubmitHandler<IRegisterMerchant> = (data) => {
    toast.promise(
      API.post("/auth/seller/register", data, {
        headers: {
          Authorization: `Bearer ${getCookie("accessToken")}`,
        },
      }),
      {
        pending: "Loading",
        success: {
          render({ data }) {
            return (data?.data as IAPIResponse).message;
          },
        },
        error: {
          render({ data }) {
            if (axios.isAxiosError(data)) {
              return (data?.response?.data as IAPIResponse).message;
            }
          },
        },
      },
      {
        autoClose: 1500,
      }
    );
  };

  const getListAddress = async () => {
    try {
      const res = await API.get("/accounts/address", {
        headers: {
          Authorization: `Bearer ${getCookie("accessToken")}`,
        },
      });
      const data = (res.data as IAPIResponse<IAddress[]>).data;
      setListAddress(data);
      setValue(
        "address_id",
        data?.find((data) => data.is_buyer_default === true)?.id!
      );
    } catch (e) {
      if (axios.isAxiosError(e)) {
        toast.error("Error fetching address", {
          toastId: "errorAddress",
          autoClose: 1500,
        });
      }
    }
  };

  const getListCourier = async () => {
    try {
      const res = await API.get("/accounts/couriers", {
        headers: {
          Authorization: `Bearer ${getCookie("accessToken")}`,
        },
      });
      setListCourier((res.data as IAPIResponse<ICourier[]>).data);
    } catch (e) {
      if (axios.isAxiosError(e)) {
        toast.error("Error fetching couriers", {
          toastId: "errorCourier",
          autoClose: 1500,
        });
      }
    }
  };

  useEffect(() => {
    getListAddress();
    getListCourier();
    setLogged(user);
  }, []);

  return (
    <>
      <Navbar />
      <div className="flex h-screen justify-center items-center">
        <ToastContainer />
        <div className="flex max-w-7xl w-full justify-around">
          <div className="hidden md:inline">
            <img
              src="/images/seller_regis.png"
              width={400}
              height={400}
              alt="seller_regis_logo"
            />
          </div>
          <div className=" flex flex-col justify-center w-full px-5 md:px-0 md:w-96">
            <h1>
              Hi, <span className="font-bold">{logged?.full_name}</span>
            </h1>
            <p className="text-sm">Lets start your journey as a seller</p>
            <form
              className="mt-5 flex flex-col gap-y-5"
              onSubmit={handleSubmit(registerMerchantHandler)}
            >
              <div className="flex flex-col">
                <label htmlFor="shop_name" className="text-sm">
                  Shop name
                </label>
                <input
                  {...register("shop_name", {
                    validate: {
                      required: (v) => v !== "" || "Shop name is required",
                    },
                  })}
                  name="shop_name"
                  id="shop_name"
                  className="rounded-md border p-2"
                />
                {errors.shop_name?.types ===
                  errors.shop_name?.types?.validate && (
                  <p role="alert" className="text-xs text-red-500 mt-1">
                    {errors.shop_name?.message}
                  </p>
                )}
              </div>
              <div className="flex flex-col">
                <label htmlFor="address_id" className="text-sm">
                  Shop address
                </label>
                <select
                  {...register("address_id", {
                    setValueAs: (v) => parseInt(v),
                  })}
                  name="address_id"
                  id="address_id"
                  className="rounded-md border p-2 border-slate-200"
                >
                  {listAddress?.map((address, i) => {
                    return (
                      <option key={i} value={address.id}>
                        {address.full_address}
                      </option>
                    );
                  })}
                </select>
              </div>
              <div className="flex flex-col">
                <label htmlFor="address_id" className="text-sm">
                  Courier
                </label>
                <div className="relative">
                  <input
                    {...register("list_courier_id", {
                      validate: {
                        required: (v) =>
                          v.length !== 0 || "Courier is required",
                      },
                    })}
                    type="text"
                    name="courier"
                    id="courier"
                    className="rounded-md w-full hover:cursor-pointer border-slate-200"
                    onClick={() => setIsDropdownCourier(!isDropdownCourier)}
                    readOnly
                    value={
                      listCourier
                        ? selectedCourier.length !== 0
                          ? selectedCourier
                              ?.map((id) => {
                                const index = listCourier.findIndex(
                                  (v) => v.id === id
                                );
                                if (index !== -1) {
                                  return listCourier![
                                    index!
                                  ].name.toUpperCase();
                                }
                              })
                              .join(",")
                          : "Please select at least 1 courier"
                        : "Error fetching couriers"
                    }
                  />
                  <div
                    className={`${
                      isDropdownCourier
                        ? "visible opacity-100"
                        : "invisible opacity-0 "
                    } transition absolute w-full bg-white shadow-md rounded-bl-md rounded-br-md`}
                  >
                    {listCourier?.map((courier, i) => {
                      return (
                        <div
                          key={i}
                          className="p-2 flex gap-x-1 items-center hover:cursor-pointer hover:bg-slate-200 transition"
                          onClick={() => {
                            if (
                              getValues("list_courier_id").includes(courier.id)
                            ) {
                              setValue(
                                "list_courier_id",
                                getValues("list_courier_id").filter(
                                  (id) => id !== courier.id
                                )
                              );

                              return setSelectedCourier(
                                getValues("list_courier_id")
                              );
                            }

                            setValue("list_courier_id", [
                              ...getValues("list_courier_id"),
                              courier.id,
                            ]);
                            return setSelectedCourier(
                              getValues("list_courier_id")
                            );
                          }}
                        >
                          <p>{courier.name.toUpperCase()}</p>
                          {selectedCourier.includes(courier.id) && <BsCheck />}
                        </div>
                      );
                    })}
                  </div>
                </div>
                {errors.list_courier_id?.types ===
                  errors.list_courier_id?.types?.validate && (
                  <p role="alert" className="text-xs text-red-500 mt-1">
                    {errors.list_courier_id?.message}
                  </p>
                )}
              </div>
              <div className="mt-5">
                <Button
                  text="Register my shop"
                  styling="p-2 bg-[#364968] w-full rounded-md text-white"
                />
              </div>
            </form>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default MyShop;
