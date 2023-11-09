import React, { useState, useEffect } from "react";
import ProfileLayout from "@/components/ProfileLayout";
import Button from "@/components/Button";
import { IAddress } from "@/interfaces/user_interface";
import { API } from "@/network";
import { getCookie } from "cookies-next";

// full_address: string;
// detail: string;
// zip_code: string;
// kelurahan: string;
// sub_district: string;
// district: string;
// province: string;
// is_buyer_default: boolean;

interface IIndividualAddressProps {
  detail: string;
  postalCode: string;
  kelurahan: string;
  subDistrict: string;
  district: string;
  province: string;
  default: boolean;
}

const IndividualAddress = (props: IIndividualAddressProps) => {
  return (
    <div className="border-2 p-4">
      <div className="flex justify-between items-center">
        <div>
          <h1>{props.detail}</h1>
          <h1>{`${props.kelurahan.toUpperCase()}, ${props.subDistrict.toUpperCase()}, ${props.district.toUpperCase()}, ${props.province.toUpperCase()}, ID ${
            props.postalCode
          }`}</h1>
          {props.default && <h1 className="text-orange-500">[DEFAULT]</h1>}
        </div>
        <div className="text-right flex flex-col gap-3">
          <div className="flex justify-end gap-2 px-2">
            <h1 className="text-blue-600 hover:cursor-pointer hover:underline">
              Edit
            </h1>
            <h1>|</h1>
            <h1 className="text-blue-600 hover:cursor-pointer hover:underline">
              Delete
            </h1>
          </div>
          <h1
            className={`px-3 py-1 rounded-full ${
              props.default
                ? "bg-slate-200"
                : "bg-[#fddf97] hover:cursor-pointer"
            }`}
          >
            Set as Default
          </h1>
        </div>
      </div>
    </div>
  );
};

const AddressPage = () => {
  const [addressData, setAddressData] = useState<IAddress[]>([]);

  const getAddressData = async () => {
    try {
      const response = await API.get("/accounts/address", {
        headers: {
          Authorization: `Bearer ${getCookie("accessToken")}`,
        },
      });

      setAddressData(response.data.data);
    } catch (e) {
      console.log(e);
    }
  };

  useEffect(() => {
    getAddressData();
  }, []);

  return (
    <div className="overflow-hidden">
      <ProfileLayout currentPage="My Address">
        <div className="w-full mx-auto mt-6 ">
          <div className="flex items-center justify-between pl-[50px] pr-[65px]">
            <h1 className="text-[30px]">Manage Address</h1>

            <Button
              text="Add new address"
              styling="bg-[#fddf97] p-3 rounded-[8px] w-[200px] mobile:w-[100px] my-4"
            />
          </div>
        </div>

        <div className="flex flex-col gap-6 overflow-y-scroll h-screen px-[50px] pt-[30px] pb-[250px]">
          {addressData.map((data, index) => (
            <IndividualAddress
              key={index}
              detail={data.detail}
              postalCode={data.zip_code}
              kelurahan={data.kelurahan}
              subDistrict={data.sub_district}
              district={data.district}
              province={data.province}
              default={data.is_buyer_default}
            />
          ))}
        </div>
      </ProfileLayout>
    </div>
  );
};

export default AddressPage;
