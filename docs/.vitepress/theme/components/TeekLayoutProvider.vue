<script setup lang="ts" name="TeekLayoutProvider">
import Teek from "vitepress-theme-teek";
import ContributeChart from "./ContributeChart.vue";
import NotFound from "./404.vue";
import SupabaseComments from "./SupabaseComments.vue";
import AuthPage from "./AuthPage.vue";
import UserSettings from "./UserSettings.vue";
import NavUser from "./NavUser.vue";
import { useData } from "vitepress";

const { frontmatter } = useData();

</script>

<template>
  <Teek.Layout>
    <!-- 导航栏右侧添加用户组件 -->
    <template #nav-bar-content-after>
      <NavUser />
    </template>

    <template #teek-archives-top-before>
      <ContributeChart />
    </template>

    <template #not-found>
      <NotFound />
    </template>
    
    <!-- 自定义认证页面（覆盖主题默认登录页） -->
    <template #teek-login-page>
      <AuthPage v-if="frontmatter.loginPage" />
    </template>
    
    <!-- 用户设置页面 -->
    <template #doc-before>
      <UserSettings v-if="frontmatter.userSettings" />
    </template>
    
    <!-- 在文档内容后添加评论区（设置页面除外） -->
    <template #doc-after>
      <SupabaseComments v-if="!frontmatter.userSettings && frontmatter.comment !== false" />
    </template>
  </Teek.Layout>
</template>

<style lang="scss">
.tk-my.is-circle-bg {
  margin-bottom: 20px;

  .tk-my__avatar.circle-rotate {
    margin-top: 200px;
  }
}
</style>
