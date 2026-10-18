import AddFrameMaterialsModal from "@/components/frame-materials/AddFrameMaterialsModal"
import DeleteFrameMaterialModal from "@/components/frame-materials/DeleteFrameMaterialsModal"
import EditFrameMaterialModal from "@/components/frame-materials/EditFrameMaterialModal"
import FrameMaterial from "@/components/frame-materials/FrameMaterial"
import FrameMaterialList from "@/components/frame-materials/FrameMaterialList"
import Header from "@/components/frame-materials/header"
import PageWrapper from "@/components/wrappers/PageWrapper"

const page=()=>
{
    return(
        <>
        <div className="flex flex-col h-full overflow-auto">
      <DeleteFrameMaterialModal />
       <EditFrameMaterialModal /> 
      <AddFrameMaterialsModal />
      <Header />
      <PageWrapper>
     <FrameMaterialList />
      </PageWrapper>
    </div>
        </>
    )
}
export default page