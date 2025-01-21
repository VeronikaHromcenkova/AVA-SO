import { SuggestedQuestion } from "./SuggestedMessages";

export const suggestedQuestion: SuggestedQuestion[] = [
  {
    title: "Create social media post",
    message: "",
    children: [
      {
        title: "Create Instagram post",
        message: "create Instagram post about new employee"
      },
      {
        title: "Create Facebook post",
        message: "create Facebook post about new employee"
      },
      {
        title: "Create LinkedIn post",
        message: "create LinkedIn post about new employee"
      }
    ]
  },
  {
    title: "Create email template",
    message: "",
    children: [
      {
        title: "Christmas event email",
        message: "create email template for all employees about Christmas party"
      },
      {
        title: "Expense claim email",
        message: "create email to claim expenses for online courses"
      },
      {
        title: "Brownbag Session email",
        message: "create email template for all employees about new Brownbag Session"
      },
      {
        title: "Automatic reply email",
        message: "create email template for automatic reply when out of office"
      }
    ]
  },
  {
    title: "Create blog post",
    message: "create blog post about new Arvato Systems logo",
    children: [
      {
        title: "New logo blog post",
        message: "create blog post about new Arvato Systems logo"
      },
      {
        title: "New employee blog post",
        message: "create blog post about new employee at Arvato Systems"
      }
    ]
  },
  {
    title: "Create marketing banner",
    message: "",
    children: [
      {
        title: "New office banner",
        message: "create marketing banner about new office"
      },
      {
        title: "Careers banner",
        message: "create marketing banner about new careers available at Arvato Systems"
      }
    ]
  }
];
