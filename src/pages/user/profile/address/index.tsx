import React, { useState, useEffect } from "react";
import ProfileLayout from "@/components/ProfileLayout";
import Button from "@/components/Button";
import { IAddress } from "@/interfaces/user_interface";
import { API } from "@/network";
import { getCookie } from "cookies-next";
import Modal from "@/components/Modal";
import Input from "@/components/Input";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { IAPIResponse } from "@/interfaces/api_interface";
import axios from "axios";
import { clientUnauthorizeHandler } from "@/utils/utils";
import { useRouter } from "next/router";
import { useUserStore } from "@/store/userStore";
import Head from "next/head";

interface IIndividualAddressProps {
  id: number;
  detail: string;
  postalCode: string;
  kelurahan: string;
  subDistrict: string;
  district: string;
  province: string;
  default: boolean;
  setNewDefault: (id: number) => void;
  showDeleteModal: () => void;
  setIdToDelete: (id: number) => void;
  showEditModal: () => void;
}

const IndividualAddress = (props: IIndividualAddressProps) => {
  return (
    <div className="border-2 p-4">
      <div className="flex justify-between items-center md:flex-row md:gap-0 flex-col gap-10">
        <div>
          <h1>{props.detail}</h1>
          <h1>{`${props.kelurahan.toUpperCase()}, ${props.subDistrict.toUpperCase()}, ${props.district.toUpperCase()}, ${props.province.toUpperCase()}, ID ${
            props.postalCode
          }`}</h1>
          {props.default && <h1 className="text-orange-500">[DEFAULT]</h1>}
        </div>
        <div className="text-right flex flex-col md:gap-3 items-center gap-6">
          <div className="flex justify-end gap-2 px-2">
            <h1
              onClick={() => {
                props.setIdToDelete(props.id);
                props.showEditModal();
              }}
              className="text-blue-600 hover:cursor-pointer hover:underline"
            >
              Edit
            </h1>
            <h1>|</h1>
            <h1
              onClick={() => {
                props.setIdToDelete(props.id);
                props.showDeleteModal();
              }}
              className="text-blue-600 hover:cursor-pointer hover:underline"
            >
              Delete
            </h1>
          </div>
          <h1
            onClick={() => {
              if (!props.default) {
                props.setNewDefault(props.id);
              } else {
                null;
              }
            }}
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

interface IProvinceDistrictData {
  id: number;
  name: string;
}

interface IDropdownProps {
  label: string;
  data: IProvinceDistrictData[];
  onChange: (e: any) => void;
  value?: number;
}

interface IAddAddressModal {
  closeFunction: () => void;
}

const AddressDropdown = (props: IDropdownProps) => {
  return (
    <div>
      <p className="pb-2">{props.label}</p>
      <select
        onChange={(e) => props.onChange(e)}
        className={`p-4 md:w-[450px] w-full rounded`}
        name="category-dropdown"
        value={props.value}
      >
        {props.data.map((option, index) => (
          <option key={index} value={option.id}>
            {option.name.toUpperCase()}
          </option>
        ))}
      </select>
    </div>
  );
};

const AddAddressModal = (props: IAddAddressModal) => {
  const [provinceData, setProvinceData] = useState<IProvinceDistrictData[]>([]);
  const [districtData, setDistrictData] = useState<IProvinceDistrictData[]>([]);
  const [currentSelectedProvinceId, setCurrentSelectedProvinceId] =
    useState<number>(1);
  const [currentSelectedDistrictId, setCurrentSelectedDistrictId] =
    useState<number>(1);
  const [districtIndex, setDistrictIndex] = useState<number>(0);

  const [detail, setDetail] = useState<string>("");
  const [subDistrict, setSubDistrict] = useState<string>("");
  const [kelurahan, setKelurahan] = useState<string>("");
  const [postalCode, setPostalCode] = useState<string>("");
  const router = useRouter();
  const { updateUser } = useUserStore();

  const getProvinceData = async () => {
    try {
      const response = await API.get("/address/provinces");

      setProvinceData(response.data.data.provinces);
    } catch (e) {
      console.log(e);
    }
  };

  const getDistrictData = async () => {
    try {
      const response = await API.get(
        `/address/provinces/${currentSelectedProvinceId}/districts`
      );

      setDistrictData(response.data.data.districts);
      setCurrentSelectedDistrictId(
        response.data.data.districts[districtIndex].id
      );
    } catch (e) {
      console.log(e);
    }
  };

  useEffect(() => {
    getProvinceData();
  }, []);

  useEffect(() => {
    getDistrictData();
  }, [currentSelectedProvinceId]);

  const submit = async (e: any) => {
    e.preventDefault();

    if (
      subDistrict === "" ||
      kelurahan === "" ||
      postalCode === "" ||
      detail === ""
    ) {
      toast.error("All fields must be filled!");
      return;
    }

    const sendData = {
      province_id: parseInt(currentSelectedProvinceId.toString()),
      district_id: parseInt(currentSelectedDistrictId.toString()),
      sub_district: subDistrict,
      kelurahan: kelurahan,
      zip_code: postalCode,
      detail: detail,
    };

    try {
      toast.promise(
        API.post("/accounts/address", sendData),
        {
          pending: "Adding address...",
          success: {
            render() {
              props.closeFunction();
              return "Address successfully updated!";
            },
          },
          error: {
            render({ data }) {
              if (axios.isAxiosError(data)) {
                return `${(data.response?.data as IAPIResponse).message}`;
              }
            },
          },
        },
        {
          autoClose: 1500,
        }
      );
    } catch (e) {
      if (axios.isAxiosError(e)) {
        if (e.response?.status === 401) {
          return clientUnauthorizeHandler(router, updateUser);
        }
        return toast.error(e.message, {
          autoClose: 1500,
        });
      }
    }
  };

  return (
    <div className="bg-white p-5 rounded-md md:w-[1000px] h-[500px] md:overflow-y-hidden w-fit overflow-y-scroll">
      <div className="pb-3">
        <h1 className="text-[20px]">Add New Address</h1>
      </div>

      <div className="pt-6">
        <Input
          label="Address"
          type="text"
          name="address"
          width="w-full "
          onChange={(e) => setDetail(e.target.value)}
          required
        />
        <div className="flex justify-between pt-6 md:flex-row md:gap-0 flex-col gap-6">
          <AddressDropdown
            label="Province"
            data={provinceData}
            onChange={(e) => setCurrentSelectedProvinceId(e.target.value)}
          />
          <AddressDropdown
            label="District"
            data={districtData}
            onChange={(e) => {
              setCurrentSelectedDistrictId(e.target.value);
              setDistrictIndex(e.target.selectedIndex);
            }}
          />
        </div>
        <div className="flex justify-between pt-6 md:flex-row md:gap-0 flex-col gap-6">
          <Input
            label="Sub-district"
            type="text"
            name="subdistrict"
            width="md:basis-[33%] w-full"
            onChange={(e) => setSubDistrict(e.target.value)}
            required
          />
          <Input
            label="Kelurahan"
            type="text"
            name="kelurahan"
            width="md:basis-[33%] w-full"
            onChange={(e) => setKelurahan(e.target.value)}
            required
          />
          <Input
            label="Zip Code"
            type="text"
            name="zipcode"
            width="md:basis-[33%] w-full"
            onChange={(e) => setPostalCode(e.target.value)}
            required
          />
        </div>
      </div>
      <div className="flex justify-center mt-[50px]">
        <Button
          text="Add new address"
          onClick={submit}
          styling="bg-[#364968] p-3 rounded-[8px] w-[200px] text-white my-4"
        />
      </div>
    </div>
  );
};

interface IEditAddressModal {
  closeFunction: () => void;
  addressData: IAddress;
  currentAddressId: number;
}

const EditAddressModal = (props: IEditAddressModal) => {
  const [currentAddressData, setCurrentAddressData] = useState<IAddress>(
    props.addressData
  );
  const [provinceData, setProvinceData] = useState<IProvinceDistrictData[]>([]);
  const [districtData, setDistrictData] = useState<IProvinceDistrictData[]>([]);
  const [currentSelectedProvinceId, setCurrentSelectedProvinceId] =
    useState<number>(1);
  const [currentSelectedDistrictId, setCurrentSelectedDistrictId] =
    useState<number>(-1);
  const [districtIndex, setDistrictIndex] = useState<number>(0);

  const router = useRouter();
  const { updateUser } = useUserStore();

  const getDistrictData = async () => {
    try {
      const response = await API.get(
        `/address/provinces/${currentSelectedProvinceId}/districts`
      );

      setDistrictData(response.data.data.districts);

      if (currentSelectedDistrictId === -1) {
        for (let i = 0; i < response.data.data.districts.length; i++) {
          if (
            response.data.data.districts[i].name === currentAddressData.district
          ) {
            setCurrentSelectedDistrictId(response.data.data.districts[i].id);
            break;
          }
        }
      } else {
        setCurrentSelectedDistrictId(
          response.data.data.districts[districtIndex].id
        );
      }
    } catch (e) {
      console.log(e);
    }
  };

  const getEditData = async () => {
    try {
      const response = await API.get("/address/provinces");

      setProvinceData(response.data.data.provinces);

      for (let i = 0; i < response.data.data.provinces.length; i++) {
        if (
          response.data.data.provinces[i].name === currentAddressData.province
        ) {
          setCurrentSelectedProvinceId(response.data.data.provinces[i].id);
          break;
        }
      }
    } catch (e) {
      console.log(e);
    }
  };

  useEffect(() => {
    getEditData();
  }, []);

  useEffect(() => {
    getDistrictData();
  }, [currentSelectedProvinceId]);

  const submit = async (e: any) => {
    e.preventDefault();

    const sendData = {
      province_id: parseInt(currentSelectedProvinceId.toString()),
      district_id: parseInt(currentSelectedDistrictId.toString()),
      sub_district: currentAddressData.sub_district,
      kelurahan: currentAddressData.kelurahan,
      zip_code: currentAddressData.zip_code,
      detail: currentAddressData.detail,
      is_buyer_default: currentAddressData.is_buyer_default,
      is_seller_default: currentAddressData.is_seller_default,
    };

    try {
      toast.promise(
        API.put(`/accounts/address/${props.currentAddressId}`, sendData),
        {
          pending: "Updating address...",
          success: {
            render() {
              props.closeFunction();
              return "Address successfully updated!";
            },
          },
          error: {
            render({ data }) {
              if (axios.isAxiosError(data)) {
                return `${(data.response?.data as IAPIResponse).message}`;
              }
            },
          },
        },
        {
          autoClose: 1500,
        }
      );
    } catch (e) {
      if (axios.isAxiosError(e)) {
        if (e.response?.status === 401) {
          return clientUnauthorizeHandler(router, updateUser);
        }
        return toast.error(e.message, {
          autoClose: 1500,
        });
      }
    }
  };

  return (
    <div className="bg-white p-5 rounded-md md:w-[1000px] h-[500px] md:overflow-y-hidden w-fit overflow-y-scroll">
      <div className="pb-3">
        <h1 className="text-[20px]">Edit Address</h1>
      </div>

      <div className="pt-6">
        <Input
          label="Address"
          type="text"
          name="address"
          width="w-full "
          value={currentAddressData.detail}
          onChange={(e) =>
            setCurrentAddressData({
              ...currentAddressData,
              detail: e.target.value,
            })
          }
          required
        />
        <div className="flex justify-between pt-6 md:gap-0 md:flex-row flex-col gap-6">
          <AddressDropdown
            label="Province"
            data={provinceData}
            value={currentSelectedProvinceId}
            onChange={(e) => setCurrentSelectedProvinceId(e.target.value)}
          />
          <AddressDropdown
            label="District"
            data={districtData}
            value={currentSelectedDistrictId}
            onChange={(e) => {
              setCurrentSelectedDistrictId(e.target.value);
              setDistrictIndex(e.target.selectedIndex);
            }}
          />
        </div>
        <div className="flex justify-between pt-6 md:flex-row md:gap-0 flex-col gap-6">
          <Input
            label="Sub-district"
            type="text"
            value={currentAddressData.sub_district}
            name="subdistrict"
            width="md:basis-[33%] w-full"
            onChange={(e) =>
              setCurrentAddressData({
                ...currentAddressData,
                sub_district: e.target.value,
              })
            }
            required
          />
          <Input
            label="Kelurahan"
            type="text"
            name="kelurahan"
            width="md:basis-[33%] w-full"
            value={currentAddressData.kelurahan}
            onChange={(e) =>
              setCurrentAddressData({
                ...currentAddressData,
                kelurahan: e.target.value,
              })
            }
            required
          />
          <Input
            label="Zip Code"
            type="text"
            name="zipcode"
            value={currentAddressData.zip_code}
            width="md:basis-[33%] w-full"
            onChange={(e) =>
              setCurrentAddressData({
                ...currentAddressData,
                zip_code: e.target.value,
              })
            }
            required
          />
        </div>
      </div>
      <div className="flex justify-center mt-[50px]">
        <Button
          text="Edit address"
          onClick={submit}
          styling="bg-[#364968] p-3 rounded-[8px] w-[200px] text-white my-4"
        />
      </div>
    </div>
  );
};

interface IDeleteAddressModalProps {
  addressId: number;
  closeFunction: () => void;
  deleteFunction: (id: number) => void;
}

const DeleteAddressModal = (props: IDeleteAddressModalProps) => {
  return (
    <div className="bg-white p-5 rounded-md  md:w-[500px] h-[180px] w-[99%]">
      <div className="pb-3 text-center">
        <h1 className="text-[20px] ml-1">
          Are you sure you want to delete this address?
        </h1>
        <h1>This can&apos;t be undone!</h1>
      </div>

      <div className="flex justify-center mt-3 gap-6">
        <Button
          text="Yes"
          onClick={() => props.deleteFunction(props.addressId)}
          styling="bg-red-600 p-3 rounded-[8px] w-[100px] text-white my-4"
        />
        <Button
          text="No"
          onClick={props.closeFunction}
          styling="bg-[#364968] p-3 rounded-[8px] w-[100px] text-white my-4"
        />
      </div>
    </div>
  );
};

const AddressPage = () => {
  const [addressData, setAddressData] = useState<IAddress[]>([]);
  const router = useRouter();
  const { updateUser } = useUserStore();
  const [showAddAddressModal, setShowAddAddressModal] =
    useState<boolean>(false);

  const [showDeleteAddressModal, setShowDeleteAddressModal] =
    useState<boolean>(false);

  const [showEditAddressModal, setShowEditAddressModal] =
    useState<boolean>(false);

  const [addressToDelete, setAddressToDelete] = useState<number>(0);

  const [currentSelectedAddress, setCurrentSelectedAddress] =
    useState<IAddress>({
      id: 0,
      full_address: "",
      detail: "",
      zip_code: "",
      kelurahan: "",
      sub_district: "",
      district_id: 0,
      district: "",
      province_id: 0,
      province: "",
      is_buyer_default: false,
      is_seller_default: false,
    });

  const getAddressData = async () => {
    try {
      const response = await API.get("/accounts/address");

      let defaultIndex = 0;

      for (let i = 0; i < response.data.data.length; i++) {
        if (response.data.data[i].is_buyer_default) {
          defaultIndex = i;
          break;
        }
      }

      if (defaultIndex !== 0) {
        [response.data.data[0], response.data.data[defaultIndex]] = [
          response.data.data[defaultIndex],
          response.data.data[0],
        ];
      }

      setAddressData(response.data.data);
    } catch (e) {
      if (axios.isAxiosError(e)) {
        if (e.response?.status === 401) {
          return clientUnauthorizeHandler(router, updateUser);
        }
        return toast.error(e.message, {
          autoClose: 1500,
        });
      }
    }
  };

  useEffect(() => {
    getAddressData();
  }, []);

  const setNewDefault = async (id: number) => {
    const currentData = addressData;
    currentData.forEach((data) => (data.is_buyer_default = false));

    let sendData = {
      province_id: 0,
      district_id: 0,
      sub_district: "",
      kelurahan: "",
      zip_code: "",
      detail: "",
      is_buyer_default: false,
      is_seller_default: false,
    };

    for (let i = 0; i < currentData.length; i++) {
      if (currentData[i].id === id) {
        sendData = {
          province_id: currentData[i].province_id,
          district_id: currentData[i].district_id,
          sub_district: currentData[i].sub_district,
          kelurahan: currentData[i].kelurahan,
          zip_code: currentData[i].zip_code,
          detail: currentData[i].detail,
          is_buyer_default: true,
          is_seller_default: currentData[i].is_seller_default,
        };
        break;
      }
    }

    try {
      toast.promise(
        API.put(`/accounts/address/${id}`, sendData),
        {
          pending: "Updating default address...",
          success: {
            render() {
              getAddressData();
              return "Default address updated!";
            },
          },
          error: {
            render({ data }) {
              if (axios.isAxiosError(data)) {
                return `${(data.response?.data as IAPIResponse).message}`;
              }
            },
          },
        },
        {
          autoClose: 1500,
        }
      );
    } catch (e) {
      if (axios.isAxiosError(e)) {
        if (e.response?.status === 401) {
          return clientUnauthorizeHandler(router, updateUser);
        }
        return toast.error(e.message, {
          autoClose: 1500,
        });
      }
    }
  };

  const closeAddAddress = () => {
    setShowAddAddressModal(false);
    getAddressData();
  };

  const deleteAddress = (id: number) => {
    try {
      toast.promise(
        API.delete(`accounts/address/${id}`, {
          headers: {
            Authorization: `Bearer ${getCookie("accessToken")}`,
          },
        }),
        {
          pending: "Deleting address...",
          success: {
            render() {
              setShowDeleteAddressModal(false);
              getAddressData();
              return "Address successfully deleted!";
            },
          },
          error: {
            render({ data }) {
              if (axios.isAxiosError(data)) {
                return `${(data.response?.data as IAPIResponse).message}`;
              }
            },
          },
        },
        {
          autoClose: 1500,
        }
      );
    } catch (e) {
      if (axios.isAxiosError(e)) {
        toast.error(e.message, {
          autoClose: 1500,
        });
      }
    }
  };

  return (
    <>
      {showEditAddressModal && (
        <Modal
          content={
            <EditAddressModal
              currentAddressId={addressToDelete}
              addressData={currentSelectedAddress}
              closeFunction={() => {
                setShowEditAddressModal(false);
                getAddressData();
              }}
            />
          }
          onClose={() => setShowEditAddressModal(false)}
        />
      )}

      {showDeleteAddressModal && (
        <Modal
          content={
            <DeleteAddressModal
              addressId={addressToDelete}
              closeFunction={() => setShowDeleteAddressModal(false)}
              deleteFunction={deleteAddress}
            />
          }
          onClose={() => setShowDeleteAddressModal(false)}
        />
      )}

      {showAddAddressModal && (
        <Modal
          content={<AddAddressModal closeFunction={closeAddAddress} />}
          onClose={() => setShowAddAddressModal(false)}
        />
      )}

      <div className="overflow-hidden">
        <ToastContainer />
        <Head>
          <title>Manage Address</title>
          <link rel="icon" href="/vm2/favicon.ico" sizes="any" />
        </Head>
        <ProfileLayout currentPage="My Address">
          <div className="w-full mx-auto mt-6 ">
            <div className="flex items-center justify-between md:flex-row md:pl-[50px] md:pr-[65px] flex-col p-0">
              <h1 className="text-[30px]">Manage Address</h1>

              <Button
                text="Add new address"
                onClick={() => setShowAddAddressModal(true)}
                styling="bg-[#fddf97] p-3 rounded-[8px] md:w-[200px] my-4 w-[250px]"
              />
            </div>
          </div>

          <div className="flex flex-col gap-6 overflow-y-scroll h-screen px-[50px] pt-[30px] md:pb-[250px] pb-[380px]">
            {addressData.map((data, index) => (
              <IndividualAddress
                key={index}
                id={data.id}
                detail={data.detail}
                postalCode={data.zip_code}
                kelurahan={data.kelurahan}
                subDistrict={data.sub_district}
                district={data.district}
                province={data.province}
                default={data.is_buyer_default}
                setNewDefault={setNewDefault}
                showDeleteModal={() => setShowDeleteAddressModal(true)}
                showEditModal={() => {
                  setShowEditAddressModal(true);
                  setCurrentSelectedAddress(data);
                }}
                setIdToDelete={(addressId) => setAddressToDelete(addressId)}
              />
            ))}
          </div>
        </ProfileLayout>
      </div>
    </>
  );
};

export default AddressPage;
