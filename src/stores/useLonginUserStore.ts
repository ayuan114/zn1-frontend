import { getLoginUserUsingGet } from "@/api/userController";
import { defineStore } from "pinia";
import { ref } from "vue";

export const useLoginUserStore = defineStore("loginUser", () => {
  const loginUser = ref<API.LoginUserVO>({
    userName: "未登录",
  });

  // 获取登录用户信息
  async function fetchLoginUser() {
    const res = await getLoginUserUsingGet()
    if (res.data.code === 0 && res.data.data) {
      loginUser.value = res.data.data
    }
    return res.data.data
  }

  // 设置登录用户信息
  function setLoginUser(newLoginUser: any) {
    loginUser.value = newLoginUser;
  }

  // 初始化时获取用户信息
  fetchLoginUser();
  console.log("loginUser", loginUser.value);

  return { loginUser, setLoginUser, fetchLoginUser };
});
