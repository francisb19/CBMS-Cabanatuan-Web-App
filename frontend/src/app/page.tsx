"use client";
import { useForm, SubmitHandler } from "react-hook-form";
import { LoginDetails } from "@/components/models/account.models";
import ButtonSubmit from "@/components/inserts/ButtonSubmit";
import ModalAlert from "@/components/inserts/ModalAlert";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Metadata } from "next";
import InputTextBox from "@/components/inserts/InputTextBox";

export const metadata: Metadata = {
  title: "CBMS Home",
};

export default function Page() {
  const router = useRouter();
  const [alertModalState, setAlertModalState] = useState({
    visibility: false,
    alertHeader: "",
    alertText: "",
    alertType: "",
  });

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<LoginDetails>();

  const onSubmit: SubmitHandler<LoginDetails> = async (data) => {
    try {
      if (data.username === "itadmin" && data.password === "itadmin") {
        await setAlertModalState({
          visibility: true,
          alertHeader: "Success!",
          alertText: "Login successful!",
          alertType: "success",
        });
      } else if (data.username === "" || data.password === "") {
        await setAlertModalState({
          visibility: true,
          alertHeader: "Fail!",
          alertText: "Login failed! Complete all details!",
          alertType: "fail",
        });
      } else {
        await setAlertModalState({
          visibility: true,
          alertHeader: "Fail!",
          alertText: "Login failed! Wrong username or password!",
          alertType: "fail",
        });
      }
    } catch (e) {
      await console.log(e);
    }
  };

  const onModalAlertClose = async () => {
    if (alertModalState.alertType === "success") {
      await setAlertModalState({
        ...alertModalState,
        visibility: false,
        alertHeader: "",
        alertText: "",
        alertType: "",
      });
      await router.push("/home");
    } else {
      await setAlertModalState({
        visibility: false,
        alertHeader: "",
        alertText: "",
        alertType: "",
      });
    }
  };

  return (
    <div className="grid h-screen place-items-center bg-secondary-100">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="px-5 pt-5 pb-8 border-t-8 rounded-md shadow-2xl bg-neutral-50 shadow-primary-950 w-96 border-t-primary-950"
      >
        <div className="mb-4">
          <p className="mb-2 text-2xl font-bold text-gray-950 font">Login</p>
          <hr />
        </div>
        <InputTextBox
          {...register("username")}
          label="Username"
          placeholder="Password"
          inputType="text"
          textBoxSize="btn-full"
          labelFor="username"
        />
        <InputTextBox
          {...register("password")}
          label="Password"
          placeholder="Password"
          inputType="password"
          textBoxSize="btn-full"
          labelFor="password"
        />
        <div className="flex items-end justify-end">
          <ButtonSubmit label={"Log In"} btnType="submit" thin />
        </div>
        <ModalAlert
          isVisible={alertModalState.visibility}
          onClose={() => onModalAlertClose()}
          alertText={alertModalState.alertText}
          alertHeader={alertModalState.alertHeader}
          alertType={alertModalState.alertType}
        />
      </form>
    </div>
  );
}
