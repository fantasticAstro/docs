---
title: Ограничение сетевого трафика для предприятия с помощью списка разрешенных IP-адресов
shortTitle: Restricting network traffic
intro: Вы можете ограничить доступ к предприятиям и разрешить доступ только к ресурсам с указанных IP-адресов с помощью списка разрешенных IP-адресов.
permissions: Enterprise owners can configure IP allow lists.
miniTocMaxHeadingLevel: 3
versions:
  ghae: '*'
  ghec: '*'
type: how_to
topics:
  - Access management
  - Enterprise
  - Fundamentals
  - Networking
  - Security
redirect_from:
  - /admin/configuration/restricting-network-traffic-to-your-enterprise
  - /admin/configuration/configuring-your-enterprise/restricting-network-traffic-to-your-enterprise
ms.openlocfilehash: d9a4518f2fcc23d4b49967effb7b9a3022a7c6bd
ms.sourcegitcommit: 7a74d5796695bb21c30e4031679253cbc16ceaea
ms.translationtype: MT
ms.contentlocale: ru-RU
ms.lasthandoff: 11/28/2022
ms.locfileid: '148184015'
---
## Сведения об ограничениях сетевого трафика

По умолчанию авторизованные пользователи могут получить доступ к предприятию с любого IP-адреса. Вы можете ограничить доступ к ресурсам {% ifversion ghec %}, принадлежащим организациям в корпоративной учетной записи {% endif %}, настроив список разрешений для определенных IP-адресов. {% data reusables.identity-and-permissions.ip-allow-lists-example-and-restrictions %}

{% ifversion ghec %}

Если ваше предприятие использует {% data variables.product.prodname_emus %} с OIDC, вы можете выбрать, следует ли использовать функцию списка разрешенных IP-адресов {% data variables.product.company_short %}или использовать ограничения списка разрешений для поставщика удостоверений (IdP). Если ваше предприятие не использует {% data variables.product.prodname_emus %} с OIDC, можно использовать функцию списка разрешений {% data variables.product.company_short %}. 

{% elsif ghae %}

По умолчанию правила группы безопасности сети (NSG) Azure оставляют весь входящий трафик открытым на портах 22, 80, 443 и 25. Вы можете связаться с {% data variables.contact.github_support %}, чтобы настроить ограничения доступа для {% data variables.product.product_name %}.

Для получения ограничений на использование групп безопасности сети Azure обратитесь к {% data variables.contact.github_support %} с IP-адресами, которым должен быть разрешен доступ к {% data variables.product.product_name %}. Укажите диапазоны адресов, используя стандартный формат CIDR (бесклассовая междоменная маршрутизация). {% data variables.contact.github_support %} настроит соответствующие правила брандмауэра, чтобы ограничить сетевой доступ по протоколам HTTP, SSH, HTTPS и SMTP. Дополнительные сведения см. в разделе [Получение помощи от {% data variables.contact.github_support %}](/admin/enterprise-support/receiving-help-from-github-support).

{% endif %}

{% ifversion ghec %}

## Сведения о списке разрешенных IP-адресов {% data variables.product.company_short %}

Вы можете использовать список разрешенных IP-адресов {% data variables.product.company_short %}, чтобы управлять доступом к вашему предприятию и ресурсам, принадлежащим организациям на предприятии. 

{% data reusables.identity-and-permissions.ip-allow-lists-cidr-notation %} 

{% data reusables.identity-and-permissions.ip-allow-lists-enable %} {% data reusables.identity-and-permissions.ip-allow-lists-enterprise %} 

## Сведения о списке разрешений поставщика удостоверений

Если вы используете {% data variables.product.prodname_emus %} с OIDC, можно использовать список разрешений поставщика удостоверений. 

Использование списка разрешений поставщика удостоверений отключает конфигурации списков разрешенных IP-адресов {% data variables.product.company_short %} для всех организаций на предприятии и отключает API GraphQL для включения списков разрешенных IP-адресов и управления ими. 

По умолчанию поставщик удостоверений запускает CAP при начальном интерактивном входе SAML или OIDC в {% data variables.product.company_short %} для любой выбранной конфигурации списка разрешенных IP-адресов.

Cap OIDC применяется только для запросов к API с использованием маркера типа "пользователь—сервер", например маркера для {% data variables.product.prodname_oauth_app %} или {% data variables.product.prodname_github_app %}, действующего от имени пользователя. Cap OIDC не применяется, если {% data variables.product.prodname_github_app %} использует токен между серверами. Дополнительные сведения см. в разделах [Проверка подлинности с помощью {% data variables.product.prodname_github_apps %}](/developers/apps/building-github-apps/authenticating-with-github-apps#authenticating-as-an-installation)и [Сведения о поддержке политики условного доступа поставщиков удостоверений](/enterprise-cloud@latest/admin/identity-and-access-management/using-enterprise-managed-users-for-iam/about-support-for-your-idps-conditional-access-policy#github-apps-and-oauth-apps).

Чтобы обеспечить беспроблемное использование OIDC CAP при одновременном применении политики к маркерам типа "пользователь —сервер", необходимо скопировать все диапазоны IP-адресов из каждого {% data variables.product.prodname_github_app %}, используемых предприятием, в политику поставщика удостоверений. 

## Использование списка разрешенных IP-адресов {% data variables.product.company_short %}

### Включение списка разрешенных IP-адресов {% data variables.product.company_short %}
{% data reusables.profile.access_org %} {% data reusables.profile.org_settings %} {% data reusables.organizations.security %}
1. В разделе "Список разрешенных IP-адресов" включите список разрешенных IP-адресов. 
   - Если вы используете {% data variables.product.prodname_emus %} с OIDC, выберите раскрывающееся меню и щелкните **GitHub**.
      ![Снимок экрана: раскрывающееся меню с тремя параметрами конфигурации списка разрешенных IP-адресов: Отключено, Поставщик удостоверений и GitHub](/assets/images/help/security/enable-github-ip-allow-list.png)
   
      Выберите **Включить список разрешенных IP-адресов**.
      ![Снимок экрана: флажок для разрешения IP-адресов](/assets/images/help/security/enable-ip-allow-list-ghec.png)

   - Если вы не используете {% data variables.product.prodname_emus %} с OIDC, выберите **Включить список разрешенных IP-адресов**.
     ![Снимок экрана: флажок для разрешения IP-адресов](/assets/images/help/security/enable-ip-allowlist-enterprise-checkbox.png)
1. Выберите команду **Сохранить**.

### Добавление разрешенного IP-адреса

{% data reusables.identity-and-permissions.about-adding-ip-allow-list-entries %}

{% data reusables.identity-and-permissions.ipv6-allow-lists %}

{% data reusables.enterprise-accounts.access-enterprise %} {% data reusables.enterprise-accounts.settings-tab %} {% data reusables.enterprise-accounts.security-tab %} {% data reusables.identity-and-permissions.ip-allow-lists-add-ip %} {% data reusables.identity-and-permissions.ip-allow-lists-add-description %} {% data reusables.identity-and-permissions.ip-allow-lists-add-entry %} {% data reusables.identity-and-permissions.check-ip-address %}

### Разрешение доступа {% data variables.product.prodname_github_apps %}

{% data reusables.identity-and-permissions.ip-allow-lists-githubapps-enterprise %}

### Изменение разрешенного IP-адреса

{% data reusables.identity-and-permissions.about-editing-ip-allow-list-entries %}

{% data reusables.enterprise-accounts.access-enterprise %} {% data reusables.enterprise-accounts.settings-tab %} {% data reusables.enterprise-accounts.security-tab %} {% data reusables.identity-and-permissions.ip-allow-lists-edit-entry %} {% data reusables.identity-and-permissions.ip-allow-lists-edit-ip %} {% data reusables.identity-and-permissions.ip-allow-lists-edit-description %}
8. Нажмите кнопку **Обновить**.
{% data reusables.identity-and-permissions.check-ip-address %}

### Проверка допустимости IP-адреса

{% data reusables.identity-and-permissions.about-checking-ip-address %}

{% data reusables.enterprise-accounts.access-enterprise %} {% data reusables.enterprise-accounts.settings-tab %} {% data reusables.enterprise-accounts.security-tab %} {% data reusables.identity-and-permissions.check-ip-address-step %}

### Удаление разрешенного IP-адреса

{% data reusables.enterprise-accounts.access-enterprise %} {% data reusables.enterprise-accounts.settings-tab %} {% data reusables.enterprise-accounts.security-tab %} {% data reusables.identity-and-permissions.ip-allow-lists-delete-entry %} {% data reusables.identity-and-permissions.ip-allow-lists-confirm-deletion %}

## Использование списка разрешений поставщика удостоверений

Вы можете использовать список разрешений поставщика удостоверений, если используете {% data variables.product.prodname_emus %} с OIDC.

{% data reusables.profile.access_org %} {% data reusables.profile.org_settings %} {% data reusables.organizations.security %}
1. В разделе "Список разрешенных IP-адресов" выберите раскрывающийся список и щелкните **Поставщик удостоверений**.

   ![Снимок экрана: раскрывающееся меню с тремя параметрами конфигурации списка разрешенных IP-адресов: Отключено, Поставщик удостоверений и GitHub](/assets/images/help/security/enable-identity-provider-ip-allow-list.png)
   - При необходимости, чтобы разрешить установленным {% data variables.product.company_short %} и {% data variables.product.prodname_oauth_apps %} доступ к организации с любого IP-адреса, выберите **Пропустить проверку поставщика удостоверений для приложений**.

   ![Флажок для разрешения IP-адресов](/assets/images/help/security/ip-allow-list-skip-idp-check.png)
1. Выберите команду **Сохранить**.

{% endif %}

{% ifversion ghae %}

## Включение разрешенных IP-адресов

{% data reusables.identity-and-permissions.about-enabling-allowed-ip-addresses %}

{% data reusables.enterprise-accounts.access-enterprise %} {% data reusables.enterprise-accounts.settings-tab %} {% data reusables.enterprise-accounts.security-tab %}
1. В разделе "Список разрешенных IP-адресов" выберите **Включить список разрешенных IP-адресов**.
  ![Флажок для разрешения IP-адресов](/assets/images/help/security/enable-ip-allowlist-enterprise-checkbox.png)
4. Выберите команду **Сохранить**.

## Добавление разрешенного IP-адреса

{% data reusables.identity-and-permissions.about-adding-ip-allow-list-entries %} {% data reusables.enterprise-accounts.access-enterprise %} {% data reusables.enterprise-accounts.settings-tab %} {% data reusables.enterprise-accounts.security-tab %} {% data reusables.identity-and-permissions.ip-allow-lists-add-ip %} {% data reusables.identity-and-permissions.ip-allow-lists-add-description %} {% data reusables.identity-and-permissions.ip-allow-lists-add-entry %} {% data reusables.identity-and-permissions.check-ip-address %}

## Разрешение доступа {% data variables.product.prodname_github_apps %}

{% data reusables.identity-and-permissions.ip-allow-lists-githubapps-enterprise %}

## Изменение разрешенного IP-адреса

{% data reusables.identity-and-permissions.about-editing-ip-allow-list-entries %}

{% data reusables.enterprise-accounts.access-enterprise %} {% data reusables.enterprise-accounts.settings-tab %} {% data reusables.enterprise-accounts.security-tab %} {% data reusables.identity-and-permissions.ip-allow-lists-edit-entry %} {% data reusables.identity-and-permissions.ip-allow-lists-edit-ip %} {% data reusables.identity-and-permissions.ip-allow-lists-edit-description %}
8. Нажмите кнопку **Обновить**.
{% data reusables.identity-and-permissions.check-ip-address %}

## Проверка допустимости IP-адреса

{% data reusables.identity-and-permissions.about-checking-ip-address %}

{% data reusables.enterprise-accounts.access-enterprise %} {% data reusables.enterprise-accounts.settings-tab %} {% data reusables.enterprise-accounts.security-tab %} {% data reusables.identity-and-permissions.check-ip-address-step %}

## Удаление разрешенного IP-адреса

{% data reusables.enterprise-accounts.access-enterprise %} {% data reusables.enterprise-accounts.settings-tab %} {% data reusables.enterprise-accounts.security-tab %} {% data reusables.identity-and-permissions.ip-allow-lists-delete-entry %} {% data reusables.identity-and-permissions.ip-allow-lists-confirm-deletion %}

{% endif %}

## Использование {% data variables.product.prodname_actions %} со списком разрешенных IP-адресов

{% data reusables.actions.ip-allow-list-self-hosted-runners %}
