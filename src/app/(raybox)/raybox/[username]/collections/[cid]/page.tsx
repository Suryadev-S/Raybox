const Collection = async ({ params }: { params: Promise<{ cid: string }> }) => {
    const { cid } = await params;
    return (
        <div>
            Collection:  {cid}
        </div>
    );
};

export default Collection;