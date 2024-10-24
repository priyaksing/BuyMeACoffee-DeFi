import React from 'react'

function Memo({ currentAccount, memos }) {
    return (
        <div className='flex flex-col items-center justify-center w-full'>
            {currentAccount && (
                <h1 className='flex items-center justify-center text-lg tracking-wide font-semibold pt-4 m-5 w-3/5 border-t-2'>
                    MEMOS RECEIVED
                </h1>
            )}

            {currentAccount && (memos.map((memo, idx) => {
                let timestamp = Number(memo.timestamp);
                timestamp = new Date(timestamp * 1000);

                return (
                    <div key={idx} className='flex flex-col w-3/5 justify-center items-center rounded-md gap-y-2 py-2 px-2 mb-2 bg-white bg-opacity-40 border-white text-violet-600'>
                        <p className='font-semibold'>"{memo.message}"</p>
                        <p><span className='font-semibold'>From:</span> {memo.name} <span className='italic font-thin text-sm'>at {timestamp.toLocaleString()}</span></p>
                    </div>
                )
            }))}
        </div>
    )
}

export default Memo
