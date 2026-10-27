---
name: convertToSupabase
description: Convert a page from using Django to using the Supabase Javascript SDK to CREATE, READ, UPDATE, and DELETE data
---

# Convert to Supabase
Take all of the functions that CREATE data, READ data, UPDATE data, and DELETE data for a component and convert them from using Django endpoints to using the Supabase JavaScript SDK directly

## Overview
For all the pages in our app we use Django endpoints to handle data creation, reading, updating and deleting. This skill is for converting a page away from using Django and instead to use the Supabase JavaScript SDK instead. We also use TanStack Query for all of our data interactions on pages and we have a very specific pattern for how we use TanStack Query in combination with the Supabase JavaScript SDK.

### Review the data loading function(s)
On all our pages we will have a function that loads the initial data on the page, keep in mind on some pages this might be split into multiple functions and sometimes it will already be using TanStack Query. We first want to find the data loading functions then use the /grillMe skill to go over these functions and how they work with me so that we can reach a common understanding of how the data loading functions work.

Once you have the data loading functions you will follow the conversion steps below to convert it to using Supabase -


## Conversion steps
1. If one does not exist create a "data" folder inside the folder for the page.
2. Inside the "data" folder we will create javascript files that contain the SELECT, CREATE, UPDATE, and DELETE functions. The files should be named based on what function area will be contained in the file, so for instance if you are creating a function to read data using the Supabase JavaScript SDK, you will put that function in a folder called /select and then in a file called select.js. Create the folder structure for the file if it does not already exist, if it does exist for the function area you are creating just add your function to the existing file.
3. Create a function that uses the Supabase JavaScript SDK for what you want to do, for instance if you want to select data from Supabase create a function for selecting the data according to the following pattern -

```JavaScript
export const selectContactData = async (contactId, site_id) => {
  const { data, error } = await supabase
    .from("contacts_contact")
    .select(`
    *,
    contacts_contacttag_contacts (
      contacttag_id,
      contacts_contacttag (
        id,
        name,
        color
      )
    )
  `)
    .match({ id: contactId, site_id: site_id });
  if (error) {
    throw error;
  }
  return data[0];
};
```

Notice that the naming convention is {function area}{component}Data, so for selecting data on the contact page this becomes selectContactData. We also want to identify any parameters that need to be passed in and pass those in. If an error is returned by the supabase function we throw an error, otherwise we return the data.

4. Once we have the Supabase function we then use it inside a TanStack Query function. So for instance the function above is used in a TanStack Query function like this -

```JavaScript
 const getContactDetailsQuery = useQuery({
    queryKey: ["contactDetails", contactId],
    queryFn: () => selectContactData(contactId, site_id),
    onSuccess: (data) => {
 
      setContactDetails(data);
    },
  });
  ```

### Review the data submission functions
On all our pages we will have a function that submits data, keep in mind on some pages this might be split into multiple functions and sometimes it will already be using TanStack Query. We first want to find the data submission functions then use the /grillMe skill to go over these functions and how they work with me so that we can reach a common understanding of how the data loading functions work.

Once you understand how to convert the functions, use the conversion steps above to convert them