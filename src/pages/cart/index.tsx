import Navbar from "@/components/Navbar";
import React, { useState, useEffect } from "react";
import Button from "@/components/Button";
import { useRouter } from "next/router";
import EmptyCart from "@/components/EmptyCart";
import CartCheckoutArea from "@/components/CartCheckoutArea";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import CartTable from "@/components/CartTable";
import { API } from "@/network";
import axios from "axios";
import { getCookie } from "cookies-next";
import { ICartData } from "@/interfaces/cart_interface";
import { useCartStore } from "@/store/cartStore";
import CartTableMobile from "@/components/CartTableMobile";
import Modal from "@/components/Modal";
import { IAPIResponse } from "@/interfaces/api_interface";

interface IDeleteAllModalProps {
  deleteFunction: () => void;
  exitFunction: () => void;
}

const DeleteAllModal = (props: IDeleteAllModalProps) => {
  return (
    <div className="bg-white p-5 rounded-md  w-[500px] h-[180px] mobile:w-[99%]">
      <div className="pb-3 text-center">
        <h1 className="text-[20px] ml-1">
          Are you sure you want to delete your whole cart?
        </h1>
        <h1>This can&apos;t be undone!</h1>
      </div>

      <div className="flex justify-center mt-3 gap-6">
        <Button
          text="Yes"
          onClick={props.deleteFunction}
          styling="bg-red-600 p-3 rounded-[8px] w-[100px] text-white my-4"
        />
        <Button
          text="No"
          onClick={props.exitFunction}
          styling="bg-[#364968] p-3 rounded-[8px] w-[100px] text-white my-4"
        />
      </div>
    </div>
  );
};

const CartPage = () => {
  const router = useRouter();
  const [totalPrice, setTotalPrice] = useState<number>(0);
  const [showDeleteAllModal, setShowDeleteAllModal] = useState<boolean>(false);
  const cartStore = useCartStore();

  const [cartData, setCartData] = useState<ICartData[]>([
    {
      shop_id: 0,
      shop_name: "",
      cart_items: [
        {
          product_id: 0,
          product_image_url: "",
          product_name: "",
          product_unit_price: "",
          product_quantity: 0,
          product_total_price: "",
          isChecked: false,
        },
      ],
    },
  ]);

  const cartIsEmpty = () => {
    if (cartData.length === 0) {
      return true;
    }

    for (let i = 0; i < cartData.length; i++) {
      if (cartData[i].cart_items.length !== 0) {
        return false;
      }
    }

    return true;
  };

  const updateQuantity = (productId: number, quantity: number) => {
    const sendData = {
      product_id: productId,
      quantity: quantity,
    };

    try {
      toast.promise(
        API.put("/accounts/carts", sendData, {
          headers: {
            Authorization: `Bearer ${getCookie("accessToken")}`,
          },
        }),
        {
          pending: "Updating cart",
          success: "Cart has been updated",
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

  const addQuantity = (id: number, index: number) => {
    const currentData = [...cartData];

    currentData[index].cart_items = currentData[index].cart_items.map(
      (data) => {
        if (data.product_id === id) {
          let newQuantity =
            data.product_quantity < 99
              ? data.product_quantity + 1
              : data.product_quantity;

          updateQuantity(data.product_id, newQuantity);

          return {
            ...data,
            product_quantity: newQuantity,
          };
        } else {
          return data;
        }
      }
    );

    setCartData(currentData);
    getTotal(currentData);
  };

  const subtractQuantity = (id: number, index: number) => {
    const currentData = [...cartData];

    currentData[index].cart_items = currentData[index].cart_items.map(
      (data) => {
        if (data.product_id === id) {
          let newQuantity =
            data.product_quantity > 1
              ? data.product_quantity - 1
              : data.product_quantity;

          updateQuantity(data.product_id, newQuantity);

          return {
            ...data,
            product_quantity: newQuantity,
          };
        } else {
          return data;
        }
      }
    );

    setCartData(currentData);
    getTotal(currentData);
  };

  const handleCheckAll = (e: any, index: number) => {
    const { checked } = e.target;
    const currentData = [...cartData];

    currentData[index].cart_items = currentData[index].cart_items.map(
      (data) => {
        return { ...data, isChecked: checked };
      }
    );

    setCartData(currentData);
    getTotal(currentData);
  };

  const handleCheck = (e: any, id: number, index: number) => {
    const { checked } = e.target;
    const currentData = [...cartData];

    currentData[index].cart_items = currentData[index].cart_items.map(
      (data) => {
        if (data.product_id === id) {
          return { ...data, isChecked: checked };
        } else {
          return data;
        }
      }
    );

    setCartData(currentData);
    getTotal(currentData);
  };

  const getTotal = (updatedData: any) => {
    let newTotal = 0;
    for (let i = 0; i < updatedData.length; i++) {
      for (let j = 0; j < updatedData[i].cart_items.length; j++) {
        if (updatedData[i].cart_items[j].isChecked) {
          newTotal +=
            updatedData[i].cart_items[j].product_unit_price *
            updatedData[i].cart_items[j].product_quantity;
        }
      }
    }

    setTotalPrice(newTotal);
  };

  const deleteCart = async () => {
    setCartData([]);
    cartStore.updateCart([]);

    const token = getCookie("accessToken");
    try {
      toast.promise(
        API.delete("/accounts/carts"),
        {
          pending: "Deleting",
          success: "Cart is now empty!",
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

    setShowDeleteAllModal(false);
  };

  const deleteItem = (id: number, index: number) => {
    const currentData = [...cartData];

    currentData[index].cart_items = currentData[index].cart_items.filter(
      (data) => {
        return data.product_id !== id;
      }
    );

    // try {
    //   toast.promise(
    //     API.put("/accounts/carts", currentData, {
    //       headers: {
    //         Authorization: `Bearer ${getCookie("accessToken")}`,
    //       },
    //     }),
    //     {
    //       pending: "Updating cart",
    //       success: "Cart has been updated",
    //       error: {
    //         render({ data }) {
    //           if (axios.isAxiosError(data)) {
    //             return `${(data.response?.data as IAPIResponse).message}`;
    //           }
    //         },
    //       },
    //     },
    //     {
    //       autoClose: 1500,
    //     }
    //   );
    // } catch (e) {
    //   if (axios.isAxiosError(e)) {
    //     toast.error(e.message, {
    //       autoClose: 1500,
    //     });
    //   }
    // }

    setCartData(currentData);
    cartStore.updateCart(currentData);
    getTotal(currentData);
  };

  const checkEmptySelection = () => {
    for (let i = 0; i < cartData.length; i++) {
      for (let j = 0; j < cartData[i].cart_items.length; j++) {
        if (cartData[i].cart_items[j].isChecked) {
          return false;
        }
      }
    }

    return true;
  };

  const checkMultipleStores = () => {
    let prevShopSelected = false;
    let count = 0;

    for (let i = 0; i < cartData.length; i++) {
      for (let j = 0; j < cartData[i].cart_items.length; j++) {
        if (cartData[i].cart_items[j].isChecked && prevShopSelected) {
          return true;
        }

        if (cartData[i].cart_items[j].isChecked) {
          count++;
        }
      }

      if (count > 0) {
        prevShopSelected = true;
      }

      count = 0;
    }

    return false;
  };

  const goToCheckout = async (e: any) => {
    e.preventDefault();
    const emptySelectionMessage = () =>
      toast.error("Please select an item before checking out.");

    const movingToCheckout = () => toast.success("Redirecting to checkout...");

    if (checkEmptySelection()) {
      emptySelectionMessage();
      return;
    }

    const multipleStoreError = () => toast.error("Only one store at a time!");

    if (checkMultipleStores()) {
      multipleStoreError();
      return;
    }

    setTimeout(() => {
      router.push("/checkout");
    }, 3000);

    movingToCheckout();
    cartStore.updateCart(cartData);
  };

  const getCartData = async () => {
    const token = getCookie("accessToken");
    try {
      const res = await API.get("/accounts/carts", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const currentData = res.data.data.cart_shops;

      if (cartStore.cart !== undefined) {
        setCartData(cartStore.cart);
        getTotal(currentData);
      } else {
        setCartData(res.data.data.cart_shops);
      }
    } catch (e) {
      if (axios.isAxiosError(e)) {
        toast.error(e.message, {
          autoClose: 1500,
        });
      }
    }
  };

  useEffect(() => {
    getCartData();
  }, []);

  return (
    <>
      {showDeleteAllModal && (
        <Modal
          content={
            <DeleteAllModal
              deleteFunction={deleteCart}
              exitFunction={() => setShowDeleteAllModal(false)}
            />
          }
          onClose={() => setShowDeleteAllModal(false)}
        />
      )}
      <div>
        <Navbar />
        <ToastContainer />
        <div className="lg:max-w-7xl mx-auto">
          <div className="flex mt-[30px] justify-between mobile:block">
            <h1 className="text-[30px] mobile:text-center">My Cart</h1>
            {!cartIsEmpty() && (
              <Button
                text="Delete All"
                onClick={() => setShowDeleteAllModal(true)}
                styling="bg-red-500 px-6 text-white rounded-[8px] mobile:hidden mobile:invisible"
              />
            )}
          </div>
          {cartIsEmpty() ? (
            <EmptyCart />
          ) : (
            <div>
              <div className="pt-8 pb-[150px]">
                <div className="hidden invisible mobile:visible mobile:block">
                  {cartData.map((data, idx) => {
                    return (
                      <CartTableMobile
                        key={idx}
                        index={idx}
                        id={data.shop_id}
                        shopName={data.shop_name}
                        cartItems={data.cart_items}
                        addQuantity={addQuantity}
                        subtractQuantity={subtractQuantity}
                        handleCheckAll={handleCheckAll}
                        checkboxChange={handleCheck}
                        deleteFunction={deleteItem}
                      />
                    );
                  })}
                </div>
                <div className="mobile:hidden mobile:invisible">
                  {cartData.map((data, idx) => {
                    return (
                      <CartTable
                        key={idx}
                        index={idx}
                        id={data.shop_id}
                        shopName={data.shop_name}
                        cartItems={data.cart_items}
                        addQuantity={addQuantity}
                        subtractQuantity={subtractQuantity}
                        handleCheckAll={handleCheckAll}
                        checkboxChange={handleCheck}
                        deleteFunction={deleteItem}
                      />
                    );
                  })}
                </div>
                <div className="hidden invisible mobile:visible mobile:flex mobile:justify-center py-4">
                  {!cartIsEmpty() && (
                    <Button
                      text="Delete All"
                      onClick={() => setShowDeleteAllModal(true)}
                      styling="bg-red-500 px-6 text-white rounded-[8px] mobile:py-2 mobile:mt-3"
                    />
                  )}
                </div>
              </div>
              <CartCheckoutArea
                totalPrice={totalPrice}
                checkoutFunction={goToCheckout}
              />
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default CartPage;
