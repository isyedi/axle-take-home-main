# Parts Inventory Management Take-Home Assignment

A React-based web application for managing parts inventory with TypeScript, featuring a clean interface for adding, viewing, and persisting parts data.

## Project Overview

This application provides a comprehensive parts inventory management system built with modern web technologies. Users can add new parts with validation, view the current inventory in a table format, delete unwanted parts, and save their inventory to localStorage for persistence.

The application features:
- **React with TypeScript** for type-safe component development
- **Mock API layer** simulating real backend interactions
- **Form validation** ensuring data integrity
- **Toast notifications** for user feedback
- **Responsive design** with clean, modern styling
- **localStorage persistence** for data retention

## Your Tasks

### 1. Fix the Bug
**Issue:** The save functionality shows "Save successful!" but data doesn't actually persist when you refresh the page.

**Expected outcome:** Users should be able to save their inventory and have it reload when they refresh the page or return to the application.

### 2. Implement the following features:
**Choose and implement from the following options:**

- **Deletion functionality**: Add the ability to delete parts from the inventory
- **Pagination controls**: Add controls for navigating large inventories  
- **Dynamic sorting**: Implement sorting capabilities by name, quantity, or price
- **Audit trail**: Add tracking of when parts were added to the inventory

### 3. Update README
Document your implementation:
- Describe the bug you fixed and your solution approach
- Detail each new feature you implemented with usage instructions
- Update the "How to Run" section if needed
- Add any new dependencies or setup requirements

### 4. Summary
Write a brief summary including:
- Overview of the bug fix and your debugging process
- Description of implemented features and technical decisions
- Challenges encountered and how you overcame them
- Next steps you would take to further improve the application
- Any assumptions made during development

## How to Run

### Prerequisites
- Node.js (version 16 or higher)
- npm (comes with Node.js)

### Installation & Setup
1. Clone or download this repository
2. Navigate to the project directory
3. Install dependencies:
   ```bash
   npm install
   ```

### Development
Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5173` (or another port if 5173 is occupied).

### Building for Production
Create a production build:
```bash
npm run build
```

The built files will be in the `dist` directory.

## Project Structure

```
src/
├── components/
│   ├── PartForm.tsx      # Form component for adding new parts
│   └── PartList.tsx      # Table component for displaying parts
├── App.tsx               # Main application component
├── main.tsx              # Application entry point
├── types.ts              # TypeScript type definitions
├── api.ts                # Mock API functions (contains the bug)
└── index.css             # Application styles
```

## Technical Stack

- **Frontend Framework:** React 18 with TypeScript
- **Build Tool:** Vite
- **Styling:** Custom CSS with responsive design
- **Notifications:** react-toastify
- **State Management:** React useState hooks
- **Data Persistence:** localStorage (mock backend)

---

**Good luck with the implementation! We're excited to see your approach to debugging, feature development, and code organization.**






## My Implementation

### Fixing the Bug

**Bug 1** - saveParts() in api.ts was serializing the variable 'part' (which didn't exist) rather than the full array of parts that was being sent in. This is a typo. 
**Approach** - I first tested the save functionality by pressing save inventory after adding a part, which didn't work. I then looked at the saveParts API to see why the data wasn't saving, even if it was being added which indicates it's not going to localStorage. I checked Chrome's localStorage and found that the data was not being persisted. After checking whether the data was being serialized through logging to console, I could see that the issue was with the serialization line and that the wrong variable was being sent in. 
**Resolution** - Changed the name of the variable from 'part' to 'parts' to ensure the proper array that was being sent in was being serialized. I also checked Chrome's local storage to see if the data was being persisted. We could just use a Postman request or query the db to verify if the API was working correctly. 

**Bug 2** - The catch block in the saveParts() function was resolving the error even if it caught it, masking any indication that there could be an error. 
**Approach** - If there was an error or type mismatch, it should be reported when you save inventory in the saveParts() function. I tested this by putting a string into the await saveParts() function in App.tsx, which resulted in a successful save message. That isn't the functionality we want.  
**Resolution** - Fix resolve() in the catch block to reject(error), so that errors will be thrown and the try block will be rejected. I tested this again with a string and this time an error was thrown. 



### Feature Implementation

#### Deletion 
My approach to deletion involved looking at the system at a state management level. So, we're able to add an item to the list, but we don't necessarily have to save it. This allows changes to be made in the process of adding and deletion of items in the case of mistakes. Once we save our changes, that data persists to the backend which lowers the amount of requests performed. Thus, deleting is isolated to the frontend and I chose an approach of bulk deletion similar to emails where you have a selection mechanism to check the parts that you want deleted and confirm deletion of all of them through a modal that pops up. You press 'Select' and it gives you the option to select parts and then delete however many you want. This approach gives you flexibility over the data you have, so you can save your parts to the database when ready. It also creates a more seamless user experience since you don't have to individually delete each item when you want an item deleted and also creates a safety barrier in deletion. I will make a note to say that in a production-grade system with a backend database, it creates a safer, scalable, and more REST-friendly format by making endpoints such as create and delete into specific API requests since you are querying the database, have traceability, and can log the specific change that is happening. Also, it makes a lot of sense towards analytics purposes and querying a parts management tool if we only remove it from one table; we would want the expenses logged through linked tables regardless on a bigger scale application. I also commented out and made a mock DELETE API with deletion from the database, for reference as a different approach. However, in this case, I chose this approach for ease of use since we are working with localStorage and an array of parts. 

#### Pagination
I think the best way to do pagination in this case would be horizontal based pagination where we have multiple pages showing all the parts in our inventory. This can be expanded to however many pages we really want, but as the database gets large, we'd have to find a way to filter, sort, and query, which can be expanded upon in the third feature. We could also have gone with a scrollable UI for a pagination system using cursors to reload scroll, but that tends to work better on mobile platforms and with a large relational database since you can query it. Moreover, as a business application, I think going with pages makes more sense due to the fact that you need more granular control over data rather than just infinite scroll. Implementation-wise, I tracked state through the currentParts array which contained the current page's parts and was calculated based on both the items per page and the total amount of parts in the database. I spliced this from the total parts array to create pagination. After this, it just comes down to using the currentParts array to filter the rows based on the currentPage and display it to the frontend. The pages displayed are a sliding window if there are more than 3 pages of parts. 


#### Dynamic Sorting
My approach to dynamic sorting was quite simple. We need to sort based on name, price, and quantity, so these can be in ascending or descending order for all three categories. For this implementation, because the display of items is in PartList, the sorting work can be isolated to the PartList component. We are sending all of the current parts into PartList and so we can just sort that list of parts based on the category. For example, if we are sorting by price, we can take the sorting method, sort the parts array, and return a new array sorted based on price. I used useMemo for this because it's a calculation that only changes when the parts array or the sorting method changes. Once the array is sorted, we can now split it up into the sections that will be displayed on the frontend through the pagination calculations. Tracking the state of the type of sorting method we want in the UI definition allows us to update this with useMemo upon change. The functionality is very simple: it's a dropdown menu detailing the different ways you can sort based on price, quantity, name, and ascending or descending order.



### 4. Summary 

I tackled this project with the mindset of breaking it up into its constituent parts as best as possible. That started with the bug fixing itself which I have a general approach by trying my best to reproduce the bug through testing the inputs and outputs or the functionality of the app to see what the problem was. I then look to isolate where the bug is and find out at what point does it occur, so we have to deep dive into the sections of the code and go line-by-line to see where the issue happens. Once it's isolated or at least determined, we can look towards modifying the code to see how we can get the desired functionality. In the case of saveParts(), we had to both fix a variable and test that it was working and also test error catching through a push notification. This involves understanding the processes at hand and testing the functionality as best as possible when finding a solution. I think that is an overall good approach towards debugging. 

As far as the implemented features, I was able to create a functioning app with selected deletion of parts, horizontal page-based pagination, and dynamic sorting. I dive deeper into my technical decision-making strategy above in each of the feature sections, but it was largely informed by the nature of the app itself as well as how we're approaching the database. For example, our app has a save inventory button which makes it easy for adding and deletion since you can save the state of the inventory after any changes, but in a larger system, we would want logs detailing when something was added and deleted and what was update (especially for analytics or linked tables). We also used an array to store the parts, but having a linked relational db would make more sense at a bigger scale due to all the different ways inventory data can be used. I also think production-grade systems that are built for scale need to have more considerations like limiting requests to the database or offset-based pagination (in this case). I decided to go for the functionality that would make the most sense in an admin dashboard like this, so I opted for selected deletion in a bulk manner (if desired), page-based pagination (mocking offset), and dynamic sorting with a simple dropdown maintaining the state of the dashboard. 

The main challenges I faced were related to picking design choices for this. I initially chose to make a deleteParts API, but opted against it after looking at the nature of having a save inventory button. This selected approach based on the frontend creates a simpler structure toward deletion that can utilize dynamic sorting. I also struggled with page-based pagination versus a scrollable UI, but I thought about how it helps to have pages in an admin dashboard to see data at a more granular level and allow you to jump pages. I was challenged by the implementation of the page-based pagination in this app just because the array of parts were in the main App file and I had to find a way to show only selected parts of that array on the PartList. Splicing the array was what I finally came up with because we can just splice according to what page we're on and create pages by doing some simple calculations of length and items per page. If I had more time, I also would have added audit tracking as I think it would just involve adding a list of logs and persisting to the database everytime you add a part. You would just have to serialize it back from localStorage with its own API and convert it to its proper type and display it on the frontend. 

There's no limit to improvement in the application really. I focused on functionality here, but there can be a lot of adjustments as far as design goes to create animations and nice components for a seamless user experience. There also needs to be user authentication so that inventory data is managed under specific user_ids or accounts. I think expanding to a relational database would help a lot because we can make linked tables between user analytics, inventory records, and logging expenses, allowing us to keep running totals of stock, but also a log of what sorts of parts were bought (even if they aren't in stock anymore). We can expand by adding metadata to parts, like descriptions, timestamps, suppliers, and link parts to specific products that a user could have or purchase orders. We can add updating items that are already added to the system to update quantity or pricing. There could be a search bar for finding specific products based on metadata or descriptions. Following REST API format would be useful to create structure around the microservices in the app and utilizing various API endpoints to create statelessness. We can even create a master dataset of items and utilize machine learning to predict trends and common parts. Ultimately, this could be improved by turning it into a full-fledged accounting software or ERP. The main next steps would be user authentication and using a relational database in my opinion. 

The assumptions I made during development were geared towards the nature of the application. So, I assumed we are using the array of parts as our mock database in localStorage, meaning we don't have to worry about creating specific queries overall. I assumed the Save Inventory button is the primary way we are persisting data to the database, so I didn't focus on creating specific API endpoints for deletion. Most of the data manipulation and features are isolated to the PartList, so I assumed I can keep majority of the functionality there until we add a new separate component. I also assumed every code change was being done under my discretion, so I didn't separate features out into separate PRs or GitHub commits, but if I was in development of a web application, I definitely would and would separate features and bug fixes accordingly. 

