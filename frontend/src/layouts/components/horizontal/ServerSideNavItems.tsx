// ** React Imports
import { useEffect, useState } from 'react';

// ** HTTP Client Import
import httpClient from '@/@core/utils/http';

// ** Type Import
import { HorizontalNavItemsType } from '@/@core/layouts/types';

const ServerSideNavItems = () => {
  // ** State
  const [menuItems, setMenuItems] = useState<HorizontalNavItemsType>([]);

  useEffect(() => {
    httpClient.get('/api/horizontal-nav/data').then((response) => {
      const menuArray = response.data;

      /**
       *  Replace the icon string with the component
       *  If you don't want to import the whole icon library
       *  you can create a static object and replace the icons using that object
       */

      const finalMenuArray = (items: HorizontalNavItemsType): any[] => {
        return items.map((item: any) => {
          if (item.icon) {
            // item.icon = Icons[item.icon] ;

            if (item.children) {
              finalMenuArray(item.children);
            }

            return item;
          }

          return item;
        });
      };

      setMenuItems(finalMenuArray(menuArray));
    });
  }, []);

  return menuItems;
};

export default ServerSideNavItems;
